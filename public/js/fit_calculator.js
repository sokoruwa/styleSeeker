document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('measurementForm');
    const bodyLogic = window.StyleSeekerBodyLogic;

    if (!form || !bodyLogic) {
        return;
    }

    form.addEventListener('submit', handleFormSubmit);
    loadExistingMeasurements();

    async function handleFormSubmit(event) {
        event.preventDefault();
        
        const fields = ['bust', 'waist', 'hips', 'heightFeet', 'heightInches'];
        const measurements = {};
        
        for (const field of fields) {
            const element = document.getElementById(field);
            if (!element) {
                console.error(`Field ${field} not found in the form`);
                return;
            }
            measurements[field] = parseFloat(element.value) || 0;
        }
        measurements.height = (measurements.heightFeet * 12) + measurements.heightInches;
        measurements.hipDips = Boolean(document.getElementById('hipDips')?.checked);

        const bodyTypeResult = bodyLogic.analyzeMeasurements(measurements);
        measurements.bodyType = bodyTypeResult.bodyType;
        
        // Show results to everyone
        displayResults(bodyTypeResult);

        // Check login status
        const loginStatus = await checkLoginStatus();
        
        if (loginStatus.isLoggedIn) {
            // If logged in, save measurements
            try {
                await saveMeasurements(measurements);
                showSuccessMessage();
            } catch (error) {
                showErrorMessage('Error saving measurements. Please try again.');
            }
        } else {
            // If not logged in, show login prompt below results
            showLoginPrompt();
        }
    }

    function displayResults(results) {
        const resultsContainer = document.getElementById('resultsContainer');
        const box = createElement('div', 'cyber-box mt-4');
        const header = createElement('div', 'cyber-box-header');
        header.appendChild(createHeadingWithIcon('h2', 'fas fa-robot', 'Analysis Complete'));

        const content = createElement('div', 'cyber-box-content');
        const bodyTypeSection = createElement('div', 'body-type-section');

        const highlight = createElement('div', 'cyber-highlight');
        highlight.appendChild(createHeadingWithIcon('h3', 'fas fa-dna', `Body Type Identified: ${results.bodyType}`));
        bodyTypeSection.appendChild(highlight);

        const measurementsGrid = createElement('div', 'measurements-grid mt-3');
        measurementsGrid.appendChild(createHeadingWithIcon('h4', 'fas fa-ruler', 'Measurements:'));

        const stats = createElement('div', 'cyber-stats');
        stats.append(
            createStatItem('Bust', `${formatMeasurement(results.measurements.bust)}"`),
            createStatItem('Waist', `${formatMeasurement(results.measurements.waist)}"`),
            createStatItem('Hips', `${formatMeasurement(results.measurements.hips)}"`)
        );
        measurementsGrid.appendChild(stats);
        bodyTypeSection.appendChild(measurementsGrid);
        content.appendChild(bodyTypeSection);

        const recommendations = createElement('div', 'recommendations mt-4');
        recommendations.appendChild(createHeadingWithIcon('h4', 'fas fa-tshirt', `Style Matrix for ${results.bodyType} Configuration:`));

        const recommendationBody = createElement('div', 'cyber-recommendations');
        recommendationBody.appendChild(getRecommendations(results.bodyType));
        recommendations.appendChild(recommendationBody);
        content.appendChild(recommendations);

        const newAnalysisButton = createElement('button', 'cyber-button mt-4');
        newAnalysisButton.type = 'button';
        const buttonSpan = document.createElement('span');
        buttonSpan.append(createIcon('fas fa-sync'), document.createTextNode(' New Analysis'));
        newAnalysisButton.appendChild(buttonSpan);
        newAnalysisButton.addEventListener('click', () => window.location.reload());
        content.appendChild(newAnalysisButton);

        box.append(header, content);
        replaceChildren(resultsContainer, box);

        resultsContainer.style.display = 'block';
    }

    function getRecommendations(bodyType) {
        const items = bodyLogic.getRecommendations(bodyType);
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

    function showLoginPrompt() {
        if (document.getElementById('loginPrompt')) {
            return;
        }

        const loginPrompt = document.createElement('div');
        loginPrompt.id = 'loginPrompt';
        loginPrompt.className = 'alert alert-info mt-3';
        const promptText = document.createElement('p');
        promptText.append(
            document.createTextNode('Want to save your measurements and get personalized recommendations? '),
            createTextLink('/login.html', 'Login'),
            document.createTextNode(' or '),
            createTextLink('/create_account.html', 'create an account'),
            document.createTextNode('.')
        );
        loginPrompt.appendChild(promptText);
        const promptTarget = document.querySelector('.card') || document.getElementById('measurementForm');
        if (promptTarget) {
            promptTarget.appendChild(loginPrompt);
        }
    }

    function showSuccessMessage() {
        const successMessage = document.getElementById('successMessage');
        if (!successMessage) return;

        replaceChildren(
            successMessage,
            document.createTextNode('Measurements saved successfully. '),
            createTextLink('/profile_page.html', 'View your profile'),
            document.createTextNode(' to see your measurements.')
        );
        successMessage.style.display = 'block';

        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
            errorMessage.textContent = '';
            errorMessage.style.display = 'none';
        }
    }

    function showErrorMessage(message) {
        const errorMessage = document.getElementById('errorMessage');
        if (!errorMessage) return;

        errorMessage.textContent = message;
        errorMessage.style.display = 'block';

        const successMessage = document.getElementById('successMessage');
        if (successMessage) {
            successMessage.textContent = '';
            successMessage.style.display = 'none';
        }
    }

    async function saveMeasurements(measurements) {
        try {
            const response = await fetch('/api/measurements', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(measurements)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save measurements');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error saving measurements:', error);
            throw new Error('Failed to save measurements');
        }
    }

    async function loadExistingMeasurements() {
        try {
            const response = await fetch('/api/measurements');
            if (!response.ok) {
                return;
            }

            const measurements = await response.json();
            if (measurements) {
                setInputValue('bust', measurements.bust);
                setInputValue('waist', measurements.waist);
                setInputValue('hips', measurements.hips);
                if (Number.isFinite(Number(measurements.height))) {
                    setInputValue('heightFeet', Math.floor(Number(measurements.height) / 12));
                    setInputValue('heightInches', Number(measurements.height) % 12);
                }
                const hipDips = document.getElementById('hipDips');
                if (hipDips) {
                    hipDips.checked = Boolean(measurements.hipDips);
                }
            }
        } catch (error) {
            console.error('Error loading measurements:', error);
        }
    }

    function setInputValue(id, value) {
        const input = document.getElementById(id);
        if (input) {
            input.value = value ?? '';
        }
    }

    function createElement(tagName, className, text) {
        const element = document.createElement(tagName);
        if (className) element.className = className;
        if (text !== undefined) element.textContent = text;
        return element;
    }

    function replaceChildren(parent, ...children) {
        parent.textContent = '';
        parent.append(...children);
    }

    function createIcon(className) {
        const icon = document.createElement('i');
        icon.className = className;
        return icon;
    }

    function createHeadingWithIcon(tagName, iconClass, text) {
        const heading = document.createElement(tagName);
        heading.append(createIcon(iconClass), document.createTextNode(` ${text}`));
        return heading;
    }

    function createStatItem(label, value) {
        const item = createElement('div', 'stat-item');
        item.append(createElement('span', 'stat-label', label), createElement('span', 'stat-value', value));
        return item;
    }

    function createTextLink(href, text) {
        const link = document.createElement('a');
        link.href = href;
        link.textContent = text;
        return link;
    }

    function formatMeasurement(value) {
        return Number.isFinite(Number(value)) ? String(value) : '0';
    }
});
