if (!window._txtInit) {
    window._txtInit = true;
    document.addEventListener('DOMContentLoaded', () => {
        const modelDiv = document.getElementById('modelData');
        if (!modelDiv) return;  // 올바른 페이지가 아닐 경우 중단

        const jsonStr = modelDiv.getAttribute('data-json').trim();
        console.log(jsonStr)
        let model = {};
        try { model = JSON.parse(jsonStr); }
        catch (e) { console.error('modelData parse error', e, jsonStr); }

        // 폼 요소 바인딩
        const titleInput = document.getElementById('txtTitle');
        const contentArea = document.getElementById('txtContent');
        const saveButton = document.getElementById('saveButton');
        const deleteButton = document.getElementById('deleteButton');

        // 기존 값 채우기
        if (model.title) titleInput.value = model.title;
        if (model.content) contentArea.value = model.content;

        // 저장 전 데이터 준비
        window.prepareSave = function(actionType = 'save') {
            const data = {
                title: titleInput.value,
                content: contentArea.value,
                action: actionType
            };
            document.getElementById('action').value = actionType;
            document.getElementById('jsonData').value = JSON.stringify(data, null, 2);
        };

        // 저장 버튼
        saveButton.addEventListener('click', e => {
            e.preventDefault();
            prepareSave('save');
            saveButton.form.submit();
        });

        // 삭제 버튼
        if (deleteButton) {
            deleteButton.addEventListener('click', e => {
                e.preventDefault();
                if (confirm('정말 삭제하시겠습니까?')) {
                    prepareSave('delete');
                    deleteButton.form.submit();
                }
            });
        }
    });
}