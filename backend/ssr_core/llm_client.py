"""LLM client for generating survey responses."""

from typing import Dict, List, Optional
import os
import base64
from pathlib import Path
from dataclasses import dataclass
from tqdm import tqdm
import time
import asyncio
from concurrent.futures import ThreadPoolExecutor

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

try:
    from anthropic import Anthropic
except ImportError:
    Anthropic = None

from .survey import Survey, Question


@dataclass
class RespondentProfile:
    """Profile for a simulated survey respondent."""
    description: str
    respondent_id: str = None
    gender: str = "Unknown"
    age_group: str = "Unknown"
    persona_group: str = "General"
    occupation: str = "Unknown"

    def to_dict(self) -> Dict:
        return {
            'description': self.description,
            'respondent_id': self.respondent_id,
            'gender': self.gender,
            'age_group': self.age_group,
            'persona_group': self.persona_group,
            'occupation': self.occupation
        }


@dataclass
class Response:
    """Represents a survey response."""
    respondent_id: str
    question_id: str
    text_response: str
    respondent_profile: Dict
    timestamp: Optional[str] = None
    category: Optional[str] = None  # Multi-category support: tracks which category this response is for


class LLMClient:
    """Client for generating survey responses using LLMs."""

    def __init__(
        self,
        provider: str = "openai",
        model: str = "gpt-4",
        api_key: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 500
    ):
        """
        Initialize LLM client.

        Args:
            provider: LLM provider ('openai' or 'anthropic')
            model: Model name
            api_key: API key (if None, will use environment variable)
            temperature: Sampling temperature
            max_tokens: Maximum tokens in response
        """
        self.provider = provider
        self.model = model
        self.temperature = temperature
        self.max_tokens = max_tokens

        if provider == "openai":
            if OpenAI is None:
                raise ImportError("openai package not installed. Run: pip install openai")
            api_key = api_key or os.getenv("OPENAI_API_KEY")
            self.client = OpenAI(api_key=api_key)
        elif provider == "anthropic":
            if Anthropic is None:
                raise ImportError("anthropic package not installed. Run: pip install anthropic")
            api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
            self.client = Anthropic(api_key=api_key)
        else:
            raise ValueError(f"Unsupported provider: {provider}")

    def _encode_image_to_base64(self, image_path: str) -> str:
        """Encode an image file to base64 string."""
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')

    def _construct_multi_modal_message(
        self,
        text_content: str,
        images: Optional[List[str]] = None
    ) -> Dict:
        """
        Construct a multi-modal message for LLM APIs.

        Args:
            text_content: Text prompt
            images: List of image paths to include

        Returns:
            Message dict suitable for OpenAI or Anthropic APIs
        """
        if not images or len(images) == 0:
            # Text-only message
            return {"role": "user", "content": text_content}

        # Multi-modal message with images
        if self.provider == "openai":
            # OpenAI format: list of content blocks
            content_blocks = [{"type": "text", "text": text_content}]

            for image_path in images:
                # Determine if URL or file path
                if image_path.startswith(('http://', 'https://')):
                    # Image URL - pass directly
                    content_blocks.append({
                        "type": "image_url",
                        "image_url": {"url": image_path}
                    })
                else:
                    # Local file - encode to base64
                    base64_image = self._encode_image_to_base64(image_path)
                    ext = Path(image_path).suffix.lower()
                    media_type = {
                        '.jpg': 'image/jpeg',
                        '.jpeg': 'image/jpeg',
                        '.png': 'image/png',
                        '.webp': 'image/webp',
                        '.gif': 'image/gif'
                    }.get(ext, 'image/jpeg')

                    content_blocks.append({
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{media_type};base64,{base64_image}"
                        }
                    })

            return {"role": "user", "content": content_blocks}

        elif self.provider == "anthropic":
            # Anthropic format: list of content blocks
            content_blocks = [{"type": "text", "text": text_content}]

            for image_path in images:
                # Anthropic only supports base64-encoded images
                if image_path.startswith(('http://', 'https://')):
                    # TODO: Download and encode URL images for Anthropic
                    # For now, skip URL images (can add download logic later)
                    continue

                base64_image = self._encode_image_to_base64(image_path)
                ext = Path(image_path).suffix.lower()
                media_type = {
                    '.jpg': 'image/jpeg',
                    '.jpeg': 'image/jpeg',
                    '.png': 'image/png',
                    '.webp': 'image/webp',
                    '.gif': 'image/gif'
                }.get(ext, 'image/jpeg')

                content_blocks.append({
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": media_type,
                        "data": base64_image
                    }
                })

            return {"role": "user", "content": content_blocks}

    def generate_response(
        self,
        prompt: str,
        system_message: Optional[str] = None,
        images: Optional[List[str]] = None
    ) -> str:
        """
        Generate a single response from the LLM.

        Args:
            prompt: Text prompt
            system_message: Optional system message
            images: Optional list of image paths/URLs for multi-modal queries
        """
        if self.provider == "openai":
            messages = []
            if system_message:
                messages.append({"role": "system", "content": system_message})

            # Construct multi-modal message if images provided
            user_message = self._construct_multi_modal_message(prompt, images)
            messages.append(user_message)

            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=self.temperature,
                max_tokens=self.max_tokens
            )
            return response.choices[0].message.content

        elif self.provider == "anthropic":
            # Construct multi-modal message if images provided
            user_message = self._construct_multi_modal_message(prompt, images)

            response = self.client.messages.create(
                model=self.model,
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                system=system_message or "",
                messages=[user_message]
            )
            return response.content[0].text

    def generate_responses(
        self,
        survey: Survey,
        respondent_profiles: List[RespondentProfile],
        system_message: Optional[str] = None
    ) -> List[Response]:
        """
        Generate responses for all questions and respondents.

        Args:
            survey: Survey object
            respondent_profiles: List of respondent profiles
            system_message: Optional system message for LLM

        Returns:
            List of Response objects
        """
        if system_message is None:
            system_message = (
                "You are participating in a survey. Answer each question thoughtfully "
                "based on the provided respondent profile. Provide a natural, detailed "
                "response that explains your perspective and reasoning."
            )

        responses = []
        total = len(respondent_profiles) * len(survey.questions)

        with tqdm(total=total, desc="Generating responses") as pbar:
            for i, profile in enumerate(respondent_profiles):
                for question in survey.questions:
                    prompt = survey.format_prompt(question, profile.to_dict())

                    # Prepare media content for multi-modal queries
                    images = []
                    if survey.has_categories():
                        if question.is_comparative():
                            # Comparative question: collect media from all compared categories
                            for cat_id in question.categories_compared:
                                category = survey.get_category_by_id(cat_id)
                                if category:
                                    media_data = category.prepare_media_for_llm()
                                    images.extend(media_data.get('images', []))
                                    # Append additional text context if available
                                    if media_data.get('text_context'):
                                        prompt += media_data['text_context']
                        elif question.category:
                            # Regular category question: collect media from assigned category
                            category = survey.get_category_by_id(question.category)
                            if category:
                                media_data = category.prepare_media_for_llm()
                                images.extend(media_data.get('images', []))
                                # Append additional text context if available
                                if media_data.get('text_context'):
                                    prompt += media_data['text_context']

                    try:
                        # Generate response with optional media
                        text_response = self.generate_response(
                            prompt,
                            system_message,
                            images=images if images else None
                        )

                        # Determine category for this response
                        category = None
                        if survey.has_categories():
                            if question.is_comparative():
                                category = "comparison"
                            elif question.category:
                                category = question.category

                        response = Response(
                            respondent_id=f"R{i+1:03d}",
                            question_id=question.id,
                            text_response=text_response,
                            respondent_profile=profile.to_dict(),
                            category=category  # Multi-category support
                        )
                        responses.append(response)

                        # Brief delay to avoid rate limits
                        time.sleep(0.1)

                    except Exception as e:
                        print(f"\nError generating response for {profile} on {question.id}: {e}")

                    pbar.update(1)

        return responses

    def generate_responses_concurrent(
        self,
        survey: Survey,
        respondent_profiles: List[RespondentProfile],
        system_message: Optional[str] = None,
        max_concurrent: int = 10
    ) -> List[Response]:
        """
        Generate responses for all questions and respondents using concurrent API calls.
        This is significantly faster than sequential generation.

        Args:
            survey: Survey object
            respondent_profiles: List of respondent profiles
            system_message: Optional system message for LLM
            max_concurrent: Maximum number of concurrent API calls (default: 10)

        Returns:
            List of Response objects
        """
        if system_message is None:
            system_message = (
                "You are participating in a survey. Answer each question thoughtfully "
                "based on the provided respondent profile. Provide a natural, detailed "
                "response that explains your perspective and reasoning."
            )

        responses = []
        total = len(respondent_profiles) * len(survey.questions)

        # Create all tasks upfront
        tasks = []
        for i, profile in enumerate(respondent_profiles):
            for question in survey.questions:
                tasks.append({
                    'profile': profile,
                    'profile_idx': i,
                    'question': question,
                    'system_message': system_message
                })

        # Process tasks concurrently with a thread pool
        with ThreadPoolExecutor(max_workers=max_concurrent) as executor:
            with tqdm(total=total, desc="Generating responses") as pbar:
                futures = []
                for task in tasks:
                    future = executor.submit(self._generate_single_response, survey, task)
                    futures.append(future)

                # Collect results as they complete
                for future in futures:
                    try:
                        response = future.result()
                        if response:
                            responses.append(response)
                    except Exception as e:
                        print(f"\nError generating response: {e}")
                    pbar.update(1)

        return responses

    def _generate_single_response(self, survey: Survey, task: Dict) -> Optional[Response]:
        """Helper method to generate a single response (used by concurrent generation)."""
        profile = task['profile']
        profile_idx = task['profile_idx']
        question = task['question']
        system_message = task['system_message']

        prompt = survey.format_prompt(question, profile.to_dict())

        # Prepare media content for multi-modal queries
        images = []
        if survey.has_categories():
            if question.is_comparative():
                # Comparative question: collect media from all compared categories
                for cat_id in question.categories_compared:
                    category = survey.get_category_by_id(cat_id)
                    if category:
                        media_data = category.prepare_media_for_llm()
                        images.extend(media_data.get('images', []))
                        # Append transcript to prompt if available
                        if media_data.get('text_context'):
                            prompt += media_data['text_context']
            elif question.category:
                # Regular category question: collect media from assigned category
                category = survey.get_category_by_id(question.category)
                if category:
                    media_data = category.prepare_media_for_llm()
                    images.extend(media_data.get('images', []))
                    # Append transcript to prompt if available
                    if media_data.get('text_context'):
                        prompt += media_data['text_context']

        try:
            # Generate response with optional media
            text_response = self.generate_response(
                prompt,
                system_message,
                images=images if images else None
            )

            # Determine category for this response
            category = None
            if survey.has_categories():
                if question.is_comparative():
                    category = "comparison"
                elif question.category:
                    category = question.category

            response = Response(
                respondent_id=f"R{profile_idx+1:03d}",
                question_id=question.id,
                text_response=text_response,
                respondent_profile=profile.to_dict(),
                category=category
            )
            return response

        except Exception as e:
            print(f"\nError generating response for {profile.respondent_id} on {question.id}: {e}")
            return None


def generate_diverse_profiles(
    n_profiles: int = 100,
    persona_config: Optional[Dict] = None,
    persona_groups: Optional[List] = None
) -> List[RespondentProfile]:
    """
    Generate diverse respondent profiles for survey simulation.

    Args:
        n_profiles: Number of profiles to generate
        persona_config: Optional configuration dict (legacy support)
                       Format: {
                           'mode': 'descriptions',
                           'descriptions': ['persona 1 description', 'persona 2 description', ...]
                       }
        persona_groups: Optional list of PersonaGroup objects from Survey

    Returns:
        List of RespondentProfile objects with demographics
    """
    import random

    profiles = []

    # NEW: Use persona_groups if available (preferred method)
    if persona_groups and len(persona_groups) > 0:
        # Calculate how many profiles per group based on weights
        total_weight = sum(pg.weight for pg in persona_groups)
        group_allocations = []

        for pg in persona_groups:
            proportion = pg.weight / total_weight
            count = int(n_profiles * proportion)
            group_allocations.append((pg, count))

        # Adjust for rounding errors
        allocated = sum(count for _, count in group_allocations)
        if allocated < n_profiles:
            group_allocations[0] = (group_allocations[0][0], group_allocations[0][1] + (n_profiles - allocated))

        # Generate profiles for each group
        profile_idx = 0
        for persona_group, count in group_allocations:
            for _ in range(count):
                # Select random persona from this group
                persona_description = random.choice(persona_group.personas)

                # Sample demographics from target distribution
                demographics = persona_group.sample_demographics()

                profile = RespondentProfile(
                    description=persona_description,
                    respondent_id=f"R{profile_idx+1:03d}",
                    gender=demographics['gender'],
                    age_group=demographics['age_group'],
                    persona_group=persona_group.name,
                    occupation=demographics['occupation']
                )
                profiles.append(profile)
                profile_idx += 1

    # LEGACY: Use description-based personas (backward compatibility)
    elif persona_config and persona_config.get('mode') == 'descriptions':
        descriptions = persona_config.get('descriptions', [])

        if not descriptions:
            # Fallback to default descriptions
            descriptions = [
                "A 35-year-old tech entrepreneur in San Francisco. Values innovation and efficiency. Early adopter of new technology. High income, environmentally conscious.",
                "A 68-year-old retired teacher living in rural Iowa. Fixed income, cautious about change. Prefers traditional methods. Not very tech-savvy.",
                "A 28-year-old graduate student in environmental science. Very passionate about climate change. Low income but highly educated. Socially progressive.",
                "A 45-year-old small business owner in suburban Texas. Moderate income, family-oriented. Pragmatic about environmental issues. Politically independent.",
                "A 52-year-old nurse in an urban hospital. Middle income, works long hours. Concerned about healthcare costs. Values work-life balance."
            ]

        # Generate profiles by randomly selecting from descriptions
        for i in range(n_profiles):
            description = random.choice(descriptions)
            profile = RespondentProfile(
                description=description,
                respondent_id=f"R{i+1:03d}"
            )
            profiles.append(profile)
    else:
        # Fallback: use default descriptions (backward compatibility)
        descriptions = [
            "A 35-year-old tech entrepreneur. High income, environmentally conscious.",
            "A retired teacher on fixed income. Cautious about change.",
            "A graduate student. Passionate about environmental issues.",
            "A small business owner. Pragmatic and family-oriented.",
            "A healthcare worker. Middle income, values work-life balance."
        ]

        for i in range(n_profiles):
            description = random.choice(descriptions)
            profile = RespondentProfile(
                description=description,
                respondent_id=f"R{i+1:03d}"
            )
            profiles.append(profile)

    return profiles
