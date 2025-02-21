class CommentsManager {
    constructor() {
        this.initComments();
    }

    initComments() {
        const commentBlocks = document.querySelectorAll('.comment-block');
        
        commentBlocks.forEach(block => {
            const header = block.querySelector('.comment-header');
            if (header) {
                header.addEventListener('click', () => {
                    block.classList.toggle('collapsed');
                });
            }
        });
    }

    // Метод для создания нового комментария
    createComment(data) {
        const block = document.createElement('div');
        block.className = 'comment-block';
        
        block.innerHTML = `
            <div class="comment-header">
                <div class="collapse-icon">
                    <svg viewBox="0 0 24 24">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>
                <h3 class="comment-title">${data.title}</h3>
                <div class="comment-meta">${data.author} • ${data.date}</div>
            </div>
            <div class="comment-content">
                ${data.content}
            </div>
        `;

        // Добавляем обработчик события
        const header = block.querySelector('.comment-header');
        header.addEventListener('click', () => this.toggleComment(block));

        return block;
    }

    // Метод для добавления вложенного комментария
    addReply(parentBlock, replyData) {
        let repliesContainer = parentBlock.querySelector('.comment-replies');
        
        if (!repliesContainer) {
            repliesContainer = document.createElement('div');
            repliesContainer.className = 'comment-replies';
            parentBlock.appendChild(repliesContainer);
        }

        const replyBlock = this.createComment(replyData);
        repliesContainer.appendChild(replyBlock);
    }

    // Развернуть все комментарии
    expandAll() {
        document.querySelectorAll('.comment-block.collapsed').forEach(block => {
            this.toggleComment(block);
        });
    }

    // Свернуть все комментарии
    collapseAll() {
        document.querySelectorAll('.comment-block:not(.collapsed)').forEach(block => {
            this.toggleComment(block);
        });
    }
}

// Создаем экземпляр после загрузки страницы
document.addEventListener('DOMContentLoaded', () => {
    window.commentsManager = new CommentsManager();
});

// Пример использования:
/*
const comment = commentsManager.createComment({
    title: "Заголовок комментария",
    author: "Автор",
    date: "2024-01-20",
    content: "Содержимое комментария"
});

document.querySelector('.docs-content').appendChild(comment);

// Добавление ответа
commentsManager.addReply(comment, {
    title: "Ответ на комментарий",
    author: "Другой автор",
    date: "2024-01-21",
    content: "Текст ответа"
});
*/
