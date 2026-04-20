import sys
import json
from datetime import datetime

def analyze_expenses(expenses_json):
    """
    Sample Python script for advanced expense analysis.
    This can be used to generate summaries that simple JS might find complex.
    """
    try:
        expenses = json.loads(expenses_json)
    except Exception as e:
        return f"Error: {e}"

    if not expenses:
        return "No expenses to analyze."

    total = sum(e['amount'] for e in expenses)
    categories = {}
    for e in expenses:
        cat = e['category']
        categories[cat] = categories.get(cat, 0) + e['amount']

    # Sort categories by spending
    sorted_cats = sorted(categories.items(), key=lambda x: x[1], reverse=True)

    summary = f"--- Expense Summary ---\n"
    summary += f"Total Spending: ${total:.2f}\n"
    summary += f"Highest Category: {sorted_cats[0][0]} (${sorted_cats[0][1]:.2f})\n"
    summary += "\nBreakdown:\n"
    for cat, amt in sorted_cats:
        percent = (amt / total) * 100
        summary += f"- {cat}: ${amt:.2f} ({percent:.1f}%)\n"

    # Rewards logic recommendation
    if total < 300:
        summary += "\nStatus: Master Saver! You spent less than most students. Reward: 50 Gold Points."
    else:
        summary += "\nStatus: Big Spender. Keep an eye on your transport and food costs!"

    return summary

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # User can pass JSON string to CLI
        data = sys.argv[1]
        print(analyze_expenses(data))
    else:
        # Default mock data for demo
        mock_data = [
            {"title": "Lunch", "amount": 10.0, "category": "Food"},
            {"title": "Bus", "amount": 20.0, "category": "Transport"},
            {"title": "Books", "amount": 50.0, "category": "Study"}
        ]
        print(analyze_expenses(json.dumps(mock_data)))
