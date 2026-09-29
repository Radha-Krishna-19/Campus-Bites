"""Rule-based nutrition assistant. Works offline with no external AI provider."""
from collections import Counter
from typing import Dict, List

SYMPTOMS = [
    {
        "keys": ["stress", "anxious", "anxiety", "exam", "tense"],
        "explanation": "When you are stressed, warm, easy-to-digest food and complex carbs help steady your mood and energy. Go easy on caffeine and deep-fried snacks.",
        "prefer": ["Pongal", "Curd Rice", "Fruit Salad", "Idli (2 pcs)"],
        "avoid": ["Filter Coffee", "Samosa (2 pcs)", "Chilli Chicken"],
    },
    {
        "keys": ["headache", "migraine"],
        "explanation": "Headaches are often linked to dehydration and skipped meals. Hydrating, light food with a little salt tends to help.",
        "prefer": ["Buttermilk", "Sambar Rice", "Garden Salad Bowl", "Idli (2 pcs)"],
        "avoid": ["Samosa (2 pcs)", "Chilli Chicken"],
    },
    {
        "keys": ["tired", "fatigue", "sleepy", "low energy", "weak"],
        "explanation": "For low energy, pair steady carbohydrates with protein so the energy lasts through your next class.",
        "prefer": ["Masala Dosa", "Dal Makhani", "Chicken Biryani", "Fruit Salad"],
        "avoid": ["Poori Bhaji (3 pcs)"],
    },
    {
        "keys": ["cold", "cough", "throat", "flu"],
        "explanation": "Warm, peppery and soupy dishes are soothing for a cold. Skip chilled drinks until you feel better.",
        "prefer": ["Pongal", "Sambar Rice", "Filter Coffee", "Veg Curry Bowl"],
        "avoid": ["Mango Lassi", "Buttermilk", "Curd Rice"],
    },
    {
        "keys": ["fever"],
        "explanation": "With a fever, keep meals light, soft and hydrating so your body can focus on recovering.",
        "prefer": ["Idli (2 pcs)", "Curd Rice", "Buttermilk", "Fruit Salad"],
        "avoid": ["Chilli Chicken", "Samosa (2 pcs)", "Poori Bhaji (3 pcs)"],
    },
    {
        "keys": ["stomach", "acidity", "gas", "bloat", "indigestion"],
        "explanation": "For an upset stomach, cooling probiotic foods and plain rice are gentle. Avoid oily and spicy dishes today.",
        "prefer": ["Curd Rice", "Buttermilk", "Idli (2 pcs)"],
        "avoid": ["Chilli Chicken", "Samosa (2 pcs)", "Paneer Butter Masala"],
    },
    {
        "keys": ["gym", "workout", "protein", "muscle"],
        "explanation": "After a workout, prioritise protein with some carbs to refuel and help your muscles recover.",
        "prefer": ["Chicken Biryani", "Chilli Chicken", "Paneer Butter Masala", "Dal Makhani"],
        "avoid": [],
    },
]

DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]


def _describe(item: Dict) -> str:
    n = item["nutrition"]
    return f"{item['ingredients']} · {n['calories']} kcal, {n['protein']}g protein"


class AIService:
    async def get_symptom_recommendations(self, symptom: str, available_items: List[Dict]) -> Dict:
        text = (symptom or "").lower()
        match = next((s for s in SYMPTOMS if any(k in text for k in s["keys"])), None)
        by_name = {item["name"]: item for item in available_items}

        if match:
            picks = [by_name[name] for name in match["prefer"] if name in by_name]
            explanation, avoid = match["explanation"], match["avoid"]
        else:
            picks = sorted(available_items, key=lambda i: i["nutrition"]["fiber"], reverse=True)[:3]
            explanation = (
                "I couldn't pin that down to a specific condition, so here are balanced, high-fibre picks "
                "that suit most days. Try words like stressed, tired, headache, cold or fever for targeted suggestions."
            )
            avoid = []

        return {
            "recommended_items": [
                {"item_id": i["item_id"], "item_name": i["name"], "reason": _describe(i)} for i in picks
            ],
            "avoid": avoid,
            "explanation": explanation,
        }

    async def get_collaborative_recommendations(self, order_history: List[Dict], available_items: List[Dict]) -> List[Dict]:
        """Suggest unseen dishes from the categories a student orders most."""
        by_id = {item["item_id"]: item for item in available_items}
        seen = {o["item_id"] for o in order_history}
        favourite_categories = Counter(
            by_id[o["item_id"]]["category"] for o in order_history if o["item_id"] in by_id
        )
        candidates = [i for i in available_items if i["item_id"] not in seen] or available_items
        candidates.sort(key=lambda i: (-favourite_categories.get(i["category"], 0), -i["nutrition"]["protein"]))
        return [
            {"item_id": i["item_id"], "item_name": i["name"], "reason": f"Because you enjoy {i['category'].lower()}"}
            for i in candidates[:5]
        ]

    async def generate_weekly_diet_plan(self, goal: str, current_weight: float, target_weight: float, available_items: List[Dict], **kwargs) -> Dict:
        protein_goal = kwargs.get("protein_goal") or 120
        carbs_goal = kwargs.get("carbs_goal") or 250
        calories_goal = kwargs.get("calories_goal") or 2200

        def pool(categories):
            items = [i for i in available_items if i["category"] in categories]
            return sorted(items, key=lambda i: i["nutrition"]["protein"], reverse=True) or available_items

        slots = {
            "breakfast": pool({"Breakfast"}),
            "lunch": pool({"Main Course", "Meals"}),
            "snack": pool({"Healthy Options", "Snacks", "Starters"}),
            "dinner": pool({"Main Course", "Meals", "Light Meals"}),
        }

        weekly_plan = {}
        for day_index, day in enumerate(DAYS):
            weekly_plan[day] = {}
            for slot_index, (slot, items) in enumerate(slots.items()):
                item = items[(day_index + (2 if slot == "dinner" else 0)) % len(items)] if items else None
                if item:
                    n = item["nutrition"]
                    weekly_plan[day][slot] = {
                        "item_id": item["item_id"],
                        "item_name": item["name"],
                        "portion": f"{n['calories']} kcal · {n['protein']}g protein",
                    }

        return {
            "daily_calories": calories_goal,
            "protein_target": protein_goal,
            "carbs_target": carbs_goal,
            "tips": [
                f"Aim for roughly {round(protein_goal / 4)}g of protein per meal to reach {protein_goal}g a day.",
                "Pick high-protein mains from MBA Canteen on training days and lighter meals from Samudra on rest days.",
                f"Keep carbs close to {carbs_goal}g — idli, dosa and rice dishes are clean, easily digested sources.",
                "Drink buttermilk or water with meals instead of sugary drinks to stay hydrated.",
            ],
            "weekly_plan": weekly_plan,
        }


ai_service = AIService()
