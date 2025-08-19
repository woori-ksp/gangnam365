window.addEventListener('load', function() {
    initializeToggleElements();
    initializeOrderForm();
    initializeInsuranceDetail();
});

function initializeToggleElements() {
    const eToggleElements = document.querySelectorAll('.eToggle');
    eToggleElements.forEach(element => {
        const titleElement = element.querySelector('.title');
        if (titleElement) {
            titleElement.addEventListener('click', handleToggleClick);
        }
    });
}

function handleToggleClick() {
    const toggle = this.closest('.eToggle');
    if (toggle.classList.contains('disable')) return;
    
    const hasDeliveryList = toggle.querySelector('.orderResult .xans-order-deliverylist');
    if (hasDeliveryList) {
        toggle.classList.toggle('selected');
    }
}

function initializeElements(agreementElement) {
    const elements = {
        agreeAreaElement: agreementElement.querySelector('.agreeArea'),
        agreementSection: agreementElement.querySelector('.agreement'),
        checkNoneElement: agreementElement.querySelector('.checkNone'),
        orderFixItem: document.querySelector('#orderFixItem.ec-base-button.gFull'),
        agreeMsgElement: document.querySelector('.agree-msg'),
        stickyTopElement: document.querySelector('.stickyTop')
    };

    return Object.values(elements).every(Boolean) ? elements : null;
}

function waitForRender(callback) {
    requestAnimationFrame(() => {
        requestAnimationFrame(callback);
    });
}

function createDebouncedFunction(callback) {
    let timeout = null;
    return () => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
            waitForRender(callback);
        }, 100);
    };
}

function setupResizeListener(callback) {
    let resizeTimeout;
    window.addEventListener('resize', () => {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(callback, 200);
    });
}

function createStickyUpdater(elements) {
    const { agreeMsgElement, stickyTopElement } = elements;
    
    return function updateStickyVariables() {
        const stickyTopHeight = stickyTopElement.offsetHeight;
        const isAgreeMsgVisible = getComputedStyle(agreeMsgElement).display === 'block';

        const newStickyMsgTop = stickyTopHeight + 60;
        const newStickyBtnTop = isAgreeMsgVisible ? newStickyMsgTop + 55 : stickyTopHeight + 60;

        document.documentElement.style.setProperty('--sticky-msg-top', `${newStickyMsgTop}px`);
        document.documentElement.style.setProperty('--sticky-btn-top', `${newStickyBtnTop}px`);
    };
}

function createMobilePaddingUpdater(elements) {
    const { checkNoneElement, orderFixItem } = elements;
    
    return function updateMobilePadding() {
        const isCheckNoneVisible = checkNoneElement && getComputedStyle(checkNoneElement).display === 'block';
        orderFixItem.style.paddingTop = isCheckNoneVisible ? '8px' : '';
        
        const mCafe24Order = document.querySelector('.v2 #mCafe24Order');
        if (mCafe24Order) {
            mCafe24Order.style.paddingBottom = isCheckNoneVisible ? '110px' : '';
        }
    };
}

function createPaddingUpdater(elements) {
    const updateMobilePadding = createMobilePaddingUpdater(elements);
    const updateStickyVariables = createStickyUpdater(elements);
    
    return function updatePadding() {
        const { agreeMsgElement, orderFixItem } = elements;
        
        if (window.innerWidth < 1024 && getComputedStyle(agreeMsgElement).display === 'block') {
            updateMobilePadding();
        } else {
            orderFixItem.style.paddingTop = '0';
        }
        updateStickyVariables();
    };
}

function setupElementObservers(elements, updateCallback) {
    const { agreeAreaElement, agreementSection, checkNoneElement } = elements;
    const debouncedUpdate = createDebouncedFunction(updateCallback);
    
    const elementsToObserve = [
        { element: agreeAreaElement, options: { subtree: true } },
        { element: agreementSection },
        { element: checkNoneElement },
        { element: document.querySelector('.rightGroup'), options: { subtree: true } }
    ];

    elementsToObserve.forEach(({ element, options }) => {
        if (element) {
            createObserver(element, debouncedUpdate);
        }
    });
    
    setupResizeListener(updateCallback);
}

function initializeInsuranceDetail() {
    const insuranceDetail = document.querySelector('.v2 #mCafe24Order .agreeArea .insuranceDetail');
    if (!insuranceDetail) return;
    
    insuranceDetail.addEventListener('click', handleInsuranceDetailClick);
}

function handleInsuranceDetailClick() {
    const expandWrap = this.querySelector('.ec-order-expandwrap');
    const expandButton = expandWrap?.querySelector('.ec-order-expand');
    
    if (!expandWrap || !expandButton) return;
    
    expandButton.textContent = expandWrap.classList.contains('selected') 
        ? '간단히 보기' 
        : '자세히 보기';
}

function initializeOrderForm() {
    const agreementElement = document.querySelector('#ec-jigsaw-area-agreement');
    if (!agreementElement) return;

    const elements = initializeElements(agreementElement);
    if (!elements) return;

    elements.orderFixItem.style.paddingTop = '0';
    
    const updatePadding = createPaddingUpdater(elements);
    
    waitForRender(() => {
        updatePadding();
        setupElementObservers(elements, updatePadding);
    });
}

function createObserver(element, callback) {
    const observer = new MutationObserver(callback);
    observer.observe(element, { 
        attributes: true, 
        childList: true,
        subtree: true 
    });
    return observer;
}