(function () {
    'use strict';

    function addHistoryButton(messageElement) {
        if (messageElement.querySelector('.swipe-history-button')) return;

        const swipeCounter = messageElement.querySelector('.swipes-counter');
        const mesBlock = messageElement.querySelector('.mes_block');

        if (swipeCounter && mesBlock) {
            const button = document.createElement('div');
            button.className = 'swipe-history-button fa-solid fa-clock-rotate-left interactable';
            button.title = 'Show Swipe History';
            swipeCounter.after(button);

            button.addEventListener('click', (evt) => {
                evt.stopPropagation();
                evt.preventDefault();
                handleHistoryClick(messageElement);
            });
        }
    }

    function handleHistoryClick(messageElement) {
        try {
            const context = window.SillyTavern.getContext();
            const mesId = messageElement.getAttribute('mesid');

            if (!mesId) {
                throw new Error('Could not find message ID.');
            }

            const message = context.chat[mesId];

            if (!message || !message.swipes) {
                throw new Error('No swipes found for this message.');
            }

            showSwipesModal(messageElement, mesId, message.swipes);

        } catch (error) {
            console.error('Swipe History Error:', error);
            alert(`Error: ${error.message}`);
        }
    }

    function selectSwipe(messageElement, mesId, swipeIndex) {
        const context = window.SillyTavern.getContext();
        const message = context.chat[mesId];
        const swipes = message.swipes;

        // Update the main message content
        message.mes = swipes[swipeIndex];
        message.swipe_id = swipeIndex;

        // Update the UI
        const mesBlock = messageElement.querySelector('.mes_block .mes_text');
        if (mesBlock) {
            // First, check if showdown and DOMPurify are available
            if (window.showdown && window.DOMPurify) {
                const converter = new showdown.Converter();
                const html = converter.makeHtml(swipes[swipeIndex]);
                mesBlock.innerHTML = DOMPurify.sanitize(html);
            } else {
                // Fallback to plain text if libraries are not found
                mesBlock.textContent = swipes[swipeIndex];
            }
        }

        const swipeCounter = messageElement.querySelector('.swipes-counter');
        if (swipeCounter) {
            swipeCounter.textContent = `${swipeIndex + 1}/${swipes.length}`;
        }

        // Trigger a save
        context.saveChat();

        // Close the modal
        const modal = document.getElementById('swipe-history-modal');
        if (modal) {
            modal.remove();
        }
    }

    function showSwipesModal(messageElement, mesId, swipes) {
        const existingModal = document.getElementById('swipe-history-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'swipe-history-modal';

        const modalContent = document.createElement('div');
        modalContent.className = 'swipe-history-modal-content';

        const closeButton = document.createElement('span');
        closeButton.className = 'swipe-history-modal-close';
        closeButton.innerHTML = '&times;';
        closeButton.onclick = () => modal.remove();

        const title = document.createElement('h3');
        title.textContent = 'Swipe History';

        const list = document.createElement('div');
        list.className = 'swipe-history-list';

        swipes.forEach((swipe, index) => {
            const item = document.createElement('div');
            item.className = 'swipe-history-item interactable';
            item.addEventListener('click', () => selectSwipe(messageElement, mesId, index));

            const bold = document.createElement('b');
            bold.textContent = `Swipe ${index + 1}:`;

            const pre = document.createElement('pre');
            pre.textContent = swipe;

            item.appendChild(bold);
            item.appendChild(pre);
            list.appendChild(item);
        });

        modalContent.appendChild(closeButton);
        modalContent.appendChild(title);
        modalContent.appendChild(list);
        modal.appendChild(modalContent);

        document.body.appendChild(modal);

        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        };
    }

    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && node.matches('.mes[is_user="false"]')) {
                        addHistoryButton(node);
                    }
                });
            }
        }
    });

    const chatElement = document.getElementById('chat');
    if (chatElement) {
        observer.observe(chatElement, { childList: true, subtree: true });
        // Initial run
        chatElement.querySelectorAll('.mes[is_user="false"]').forEach(addHistoryButton);
    }

})();
