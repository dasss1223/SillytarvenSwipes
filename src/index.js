(function () {
    'use strict';

    function addHistoryButton(messageElement) {
        if (messageElement.querySelector('.swipe-history-button')) {
            return;
        }

        const isMobile = document.body.classList.contains('mobile') || document.documentElement.classList.contains('mobile');

        let swipeCounter;
        if (isMobile) {
            swipeCounter = messageElement.querySelector('.swipe-counter, .swipes-counter, [class*="counter"]');
        } else {
            swipeCounter = messageElement.querySelector('.swipes-counter');
        }

        const mesBlock = messageElement.querySelector('.mes_block, .message_content, .mes_text');

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

    async function selectSwipe(messageElement, mesId, swipeIndex) {
        const context = window.SillyTavern.getContext();
        const message = context.chat[mesId];
        const swipes = message.swipes;

        // Update the main message content
        message.mes = swipes[swipeIndex];
        message.swipe_id = swipeIndex;

        // Close the modal first to ensure it doesn't interfere.
        closeModal();

        // Find and click the edit button for the message.
        const editButton = messageElement.querySelector('.mes_edit');
        if (editButton) {
            editButton.click();

            // A short delay is necessary to allow the UI to update and the "Confirm" button to appear.
            await new Promise(resolve => setTimeout(resolve, 50));

            // Find and click the "Confirm" button to trigger the re-render.
            const doneButton = messageElement.querySelector('.mes_edit_done');
            if (doneButton) {
                doneButton.click();

                // After the native render is triggered, wait a moment then update the counter.
                // This ensures our update isn't overwritten.
                setTimeout(() => {
                    const swipeCounter = messageElement.querySelector('.swipe-counter, .swipes-counter, [class*="counter"]');
                    if (swipeCounter) {
                        swipeCounter.textContent = `${swipeIndex + 1}/${swipes.length}`;
                    }
                }, 100);

            } else {
                console.error('Swipe History: Could not find the confirm edit button. Saving manually.');
                context.saveChat(); // Fallback to manual save if the button isn't found.
            }
        } else {
            console.error('Swipe History: Could not find the edit button. Saving manually.');
            context.saveChat(); // Fallback to manual save if the button isn't found.
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
        closeButton.onclick = closeModal;

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
        // Prevent background scroll while the modal is open
        document.documentElement.style.overflow = 'hidden';

        modal.onclick = (e) => {
            if (e.target === modal) {
                closeModal();
            }
        };
    }

    // Helper to close the modal and restore scrolling
    function closeModal() {
        const modal = document.getElementById('swipe-history-modal');
        if (modal) {
            modal.remove();
        }
        // Re-enable page scrolling that we disabled when opening the modal
        document.documentElement.style.overflow = '';
    }

    function initialize() {
        const chatElement = document.getElementById('chat');
        if (!chatElement || !window.SillyTavern || !window.SillyTavern.getContext) {
            // If the chat element or context isn't ready, wait and try again.
            setTimeout(initialize, 250);
            return;
        }

        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1 && node.matches('.mes[is_user="false"], .message[is_user="false"], [data-is-user="false"]')) {
                            addHistoryButton(node);
                        }
                    });
                }
            }
        });

        observer.observe(chatElement, { childList: true, subtree: true });

        // Initial run for messages already on the page
        chatElement.querySelectorAll('.mes[is_user="false"], .message[is_user="false"], [data-is-user="false"]').forEach(addHistoryButton);
    }

    // Start the initialization process
    initialize();

})();
