import os
from datetime import datetime
from typing import List, Tuple
from model.schema import WebTestResult
import shutil


def generate_combined_html_report(
    results: List[Tuple[int, WebTestResult, List[str]]],
    output_dir: str,
    test_start: datetime,
    test_duration_ms: float,
    test_id: str,
):
    total_steps = len(results)
    passed_steps = sum(1 for _, r, _ in results if r.status)
    failed_steps = total_steps - passed_steps

    css_link = "report.css"

    html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Test Report - {test_start.strftime('%Y-%m-%d %H:%M:%S')}</title>
    <link rel="stylesheet" href="{css_link}">
</head>
<body>
<div class="header">
    <h1>Test Execution Report</h1>
    <p>Execution Time: {test_start.strftime('%Y-%m-%d %H:%M:%S')}</p>
    <p>Duration: {test_duration_ms/1000:.2f}s</p>
</div>
<div class="summary">
    <h2>Summary</h2>
    <p>Total Scenarios: {total_steps}</p>
    <p>Success: {passed_steps}</p>
    <p>Failure: {failed_steps}</p>
</div>
<div class="steps"><h2>Detailed Scenarios</h2>
"""

    for idx, res, screenshots in results:
        status_str = "success" if res.status else "failed"
        html += f"""<div class="step {status_str}">
<h3>Scenario {idx}: {res.title}</h3>
<p>Status: {'Success' if res.status else 'Failed'}</p>
<p>Duration: {res.duration:.2f}s</p>
<h4>Scenario Feedback</h4><p>{res.feedback}</p>
"""

        if res.fail:
            html += "<div class='fail'><h5>Fail Reasons</h5><ul>\n"
            for fs in res.fail:
                html += f"<li>Step {fs.num}: {fs.message}</li>\n"
            html += "</ul></div>\n"

        html += "<div class='substeps'><h4>Step Results</h4>\n"
        for step in res.steps:
            sc = "success" if step.status else "failed"
            html += f"""<div class="substep {sc}">
<p><strong>Step {step.num}:</strong> {step.action}</p>
<p>Status: {'✅ Success' if step.status else '❌ Failed'}</p>
<p>Feedback: {step.feedback}</p>"""
            if step.fail:
                html += f"<p>Failure Reason: {step.fail}</p>"
            html += "</div>\n"
        html += "</div>\n"

        for img in screenshots:
            html += (
                f'<img class="screenshot" '
                f'src="screenshot?build={test_id}&scenario={idx}&file={img}" '
                f'alt="Screenshot"/>\n'
            )

        html += "</div>\n"

    html += "</div></body></html>"

    with open(os.path.join(output_dir, "report.html"), "w", encoding="utf-8") as f:
        f.write(html)

    css_src = os.path.join(os.path.dirname(__file__), "report.css")
    css_dst = os.path.join(output_dir, "report.css")
    shutil.copy(css_src, css_dst)
