document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Check login status
        const loginStatus = await checkLoginStatus();
        if (!loginStatus.isLoggedIn) {
            window.location.href = '/login.html';
            return;
        }

        // Fetch all profile data
        const response = await fetch('/api/user-profile', {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch profile data');
        }

        const userData = await response.json();

        // Display measurements if they exist
        if (userData.measurements) {
            displayMeasurements(userData.measurements);
        } else {
            displayNoMeasurements();
        }

        // Display style profile if it exists
        if (userData.styleProfile) {
            displayStyleProfile(userData.styleProfile);
        } else {
            displayNoStyleProfile();
        }

    } catch (error) {
        console.error('Error:', error);
        displayError(error.message);
    }
});

function displayMeasurements(measurements) {
    const measurementsContainer = document.getElementById('measurementsData');
    const bodyType = window.StyleSeekerBodyLogic.calculateBodyType(measurements);

    const section = createElement('div', 'cyber-box-section');
    section.appendChild(createElement('h3', null, 'Body Measurements'));

    const grid = createElement('div', 'measurements-grid');
    grid.append(
        createLabeledValue('measurement-item', 'Bust:', `${formatMeasurement(measurements.bust)}"`),
        createLabeledValue('measurement-item', 'Waist:', `${formatMeasurement(measurements.waist)}"`),
        createLabeledValue('measurement-item', 'Hips:', `${formatMeasurement(measurements.hips)}"`)
    );
    section.appendChild(grid);

    const bodyTypeSection = createElement('div', 'body-type-section');
    bodyTypeSection.appendChild(createElement('h3', null, `Body Type: ${bodyType}`));

    const recommendations = createElement('div', 'recommendations');
    recommendations.appendChild(getRecommendations(bodyType));
    bodyTypeSection.appendChild(recommendations);
    section.appendChild(bodyTypeSection);

    section.appendChild(createButtonLink('/fit_calculator.html', 'Update Measurements'));
    replaceChildren(measurementsContainer, section);
}

function displayStyleProfile(profile) {
    const styleContainer = document.getElementById('styleQuizData');
    const section = createElement('div', 'cyber-box-section');
    section.appendChild(createElement('h3', null, 'Style Profile'));

    const grid = createElement('div', 'style-grid');
    grid.append(
        createLabeledValue('style-item', 'Aesthetics:', formatList(profile.aesthetics)),
        createLabeledValue('style-item', 'Colors:', formatList(profile.colors)),
        createLabeledValue('style-item', 'Silhouettes:', formatList(profile.silhouettes)),
        createLabeledValue('style-item', 'Occasions:', formatList(profile.occasions)),
        createLabeledValue('style-item', 'Dislikes:', formatList(profile.dislikes)),
        createLabeledValue('style-item', 'Confidence:', formatConfidence(profile.confidence))
    );
    section.appendChild(grid);

    const budgetSection = createElement('div', 'recommendations-section');
    budgetSection.appendChild(createElement('h3', null, 'Budget'));
    budgetSection.appendChild(createTextBlock('div', 'recommendations', formatBudget(profile.budget)));
    section.appendChild(budgetSection);

    const fitSection = createElement('div', 'recommendations-section');
    fitSection.appendChild(createElement('h3', null, 'Fit Preferences'));
    fitSection.appendChild(createTextBlock('div', 'recommendations', formatFitPreferences(profile.fitPreferences)));
    section.appendChild(fitSection);

    const keyPiecesSection = createElement('div', 'key-pieces-section');
    keyPiecesSection.appendChild(createElement('h3', null, 'Key Pieces'));
    keyPiecesSection.appendChild(createListBlock('key-pieces', profile.keyPieces, 'No key pieces defined'));
    section.appendChild(keyPiecesSection);

    section.appendChild(createButtonLink('/chat_bot.html', 'Update Style Profile'));
    replaceChildren(styleContainer, section);
}

function displayNoMeasurements() {
    replaceChildren(
        document.getElementById('measurementsData'),
        createEmptyState('No measurements saved yet.', '/fit_calculator.html', 'Take the Fit Calculator')
    );
}

function displayNoStyleProfile() {
    replaceChildren(
        document.getElementById('styleQuizData'),
        createEmptyState('No style profile saved yet.', '/chat_bot.html', 'Take the Style Quiz')
    );
}

function displayError(message) {
    replaceChildren(document.getElementById('measurementsData'), createErrorState(message));
    replaceChildren(document.getElementById('styleQuizData'), createErrorState(message));
}

function getRecommendations(bodyType) {
    const items = window.StyleSeekerBodyLogic.getRecommendations(bodyType);
    if (!items.length) {
        return createElement('p', null, 'No specific recommendations available.');
    }

    const list = document.createElement('ul');
    items.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = item;
        list.appendChild(listItem);
    });
    return list;
}

function createElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
}

function createTextBlock(tagName, className, text) {
    const element = createElement(tagName, className, text);
    element.style.whiteSpace = 'pre-line';
    return element;
}

function createListBlock(className, items, emptyText) {
    const values = Array.isArray(items) ? items.filter(Boolean) : [];
    if (!values.length) {
        return createTextBlock('div', className, emptyText);
    }

    const container = createElement('div', className);
    const list = document.createElement('ul');
    values.forEach(value => {
        const item = document.createElement('li');
        item.textContent = value;
        list.appendChild(item);
    });
    container.appendChild(list);
    return container;
}

function replaceChildren(parent, ...children) {
    parent.textContent = '';
    parent.append(...children);
}

function createLabeledValue(className, labelText, valueText) {
    const item = createElement('div', className);
    item.append(createElement('span', 'label', labelText), createElement('span', 'value', valueText));
    return item;
}

function createButtonLink(href, label) {
    const link = createElement('a', 'cyber-button');
    link.href = href;
    link.appendChild(createElement('span', null, label));
    return link;
}

function createEmptyState(message, href, label) {
    const alert = createElement('div', 'cyber-alert info');
    alert.append(createElement('p', null, message), createButtonLink(href, label));
    return alert;
}

function createErrorState(message) {
    const alert = createElement('div', 'cyber-alert error');
    alert.append(
        createElement('p', null, `Error: ${message}`),
        createElement('p', null, 'Please try refreshing the page. If the problem persists, contact support.')
    );
    return alert;
}

function formatMeasurement(value) {
    return Number.isFinite(Number(value)) ? String(value) : '0';
}

function formatList(items) {
    const values = Array.isArray(items) ? items.filter(Boolean) : [];
    return values.length ? values.join(', ') : 'Not set';
}

function formatConfidence(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
        return 'Not set';
    }

    return `${Math.round(number * 100)}%`;
}

function formatBudget(budget = {}) {
    if (!budget) return 'Not set';

    const range = [];
    if (Number.isFinite(Number(budget.min))) range.push(`${budget.currency || 'USD'} ${budget.min}`);
    if (Number.isFinite(Number(budget.max))) range.push(`${budget.currency || 'USD'} ${budget.max}`);

    const lines = [];
    if (range.length) lines.push(range.join(' - '));
    if (budget.notes) lines.push(budget.notes);

    return lines.length ? lines.join('\n') : 'Not set';
}

function formatFitPreferences(fitPreferences = {}) {
    if (!fitPreferences) return 'Not set';

    const lines = [];
    if (fitPreferences.preferredFits?.length) lines.push(`Preferred fits: ${fitPreferences.preferredFits.join(', ')}`);
    if (fitPreferences.emphasis?.length) lines.push(`Emphasize: ${fitPreferences.emphasis.join(', ')}`);
    if (fitPreferences.avoid?.length) lines.push(`Avoid: ${fitPreferences.avoid.join(', ')}`);
    if (fitPreferences.notes) lines.push(fitPreferences.notes);

    return lines.length ? lines.join('\n') : 'Not set';
}
