document.addEventListener('DOMContentLoaded', function () {
    const jsonStr = document.getElementById('modelData').textContent.trim();
    let existingModel = {};
    try {
        existingModel = JSON.parse(jsonStr);
    } catch (e) {
        console.error(e);
    }

    const editor = document.getElementById('editor');
    const txtEditor = document.getElementById('txtEditor');
    const formatSelector = document.getElementById('formatSelector');
    const addButton = document.getElementById('addScenario');
    const template = document.getElementById('scenario-template').querySelector('.scenario');

    function bindStep(stepElem) {
        stepElem.querySelector('.del-step')
            .addEventListener('click', () => stepElem.remove());
    }

    function bindScenario(scn) {
        scn.querySelector('.add-step')
            .addEventListener('click', () => {
                const stepsDiv = scn.querySelector('.steps');
                const newStep = template.cloneNode(true).querySelector('.steps > div').cloneNode(true);
                newStep.querySelector('input.st-text').value = '';
                bindStep(newStep);
                stepsDiv.appendChild(newStep);
            });

        scn.querySelector('.del-scenario')
            .addEventListener('click', () => scn.remove());

        scn.querySelectorAll('.steps > div').forEach(bindStep);
    }

    editor.querySelectorAll('.scenario').forEach(bindScenario);

    addButton.addEventListener('click', () => {
        const newScn = template.cloneNode(true);
        newScn.querySelector('input.sc-title').value = '';
        newScn.querySelectorAll('input.st-text').forEach(i => i.value = '');
        editor.appendChild(newScn);
        bindScenario(newScn);
    });

    // ✅ 형식에 따라 UI를 토글하는 함수
    function toggleFormatUI(format) {
        console.log('[DEBUG] 포맷 선택됨:', format);

        if (format === 'json') {
            editor.style.display = 'block';
            addButton.style.display = 'inline-block';
            txtEditor.style.display = 'none';
        } else if (format === 'txt') {
            editor.style.display = 'none';
            addButton.style.display = 'none';
            txtEditor.style.display = 'block';
        }
    }

    // ✅ formatSelector 존재할 때만 동작
    if (formatSelector) {
        if (!formatSelector.value) {
            formatSelector.value = 'json'; // 기본값 설정
        }

        // 최초 상태 반영
        toggleFormatUI(formatSelector.value);

        // 값 변경 시 동작
        formatSelector.addEventListener('change', function () {
            console.log('[DEBUG] 드롭다운 변경됨 ->', this.value);
            toggleFormatUI(this.value);
        });
    } else {
        console.error('❌ formatSelector 요소를 찾을 수 없습니다!');
    }

    // 저장 전 직렬화
    window.prepareSave = function () {
        const selectedFormat = formatSelector.value;
        const title = document.getElementById('scriptTitle').value;

        if (selectedFormat === 'json') {
            const model = {
                title: title,
                scenarios: []
            };
            editor.querySelectorAll('.scenario').forEach(scn => {
                const title = scn.querySelector('input.sc-title').value;
                const steps = Array.from(scn.querySelectorAll('input.st-text')).map(i => i.value);
                model.scenarios.push({ title, steps });
            });
            document.getElementById('jsonData').value = JSON.stringify(model, null, 2);
        } else {
            const txtContent = document.getElementById('txtContent').value;
            document.getElementById('jsonData').value = txtContent;
        }
    };

    const saveButton = document.getElementById('saveButton');
    if (saveButton) {
        saveButton.addEventListener('click', function () {
            prepareSave();
            if (this.form) {
                this.form.submit();
            } else {
                let parent = this.parentNode;
                while (parent && parent.tagName !== 'FORM') {
                    parent = parent.parentNode;
                }
                if (parent) parent.submit();
                else console.error('Save button is not inside a form.');
            }
        });
    }
});
