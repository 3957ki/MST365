import openai

def process_scenario(scenario_text):
    # 시나리오 텍스트를 분석하여 각 단계로 분리
    response = openai.Completion.create(
        engine="text-davinci-003", 
        prompt=f"Divide the following scenario into steps:\n\n{scenario_text}", 
        max_tokens=100
    )
    steps = response['choices'][0]['text'].split('\n')
    step_details = []
    for step in steps:
        if step.strip():
            step_details.append({"step": len(step_details) + 1, "description": step.strip()})
    return step_details
