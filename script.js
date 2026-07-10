// Initialize Lucide Icons
lucide.createIcons();

// Navigation Function (SPA Routing)
function navigateTo(pageId, pushState = true, targetSectionId = null) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });

    // Show target page
    const targetPage = document.getElementById('page-' + pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }

    // Close mobile menu if open
    const navMenu = document.getElementById('nav-menu');
    if (navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
    }
    
    // Lazy load history events
    if (pageId === 'history' && !window.historyFetched) {
        window.historyFetched = true;
        fetchHistoryEvents();
    }

    // Scroll handling
    if (targetSectionId) {
        // slight delay to ensure rendering is complete before scrolling
        setTimeout(() => {
            const el = document.getElementById(targetSectionId);
            if (el) {
                // Adjust for fixed header height (approx 80px)
                const y = el.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        }, 100);
    } else {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    // Update browser history
    if (pushState) {
        const hashToPush = targetSectionId ? '#' + targetSectionId : '#' + pageId;
        history.pushState({ pageId: pageId, targetSectionId: targetSectionId }, '', hashToPush);
    }
}

// Handle browser back/forward buttons
window.addEventListener('popstate', (event) => {
    if (event.state && event.state.pageId) {
        navigateTo(event.state.pageId, false, event.state.targetSectionId);
    } else {
        navigateTo('home', false);
    }
});

// Mobile Menu Toggle
const menuToggle = document.getElementById('menu-toggle');
const menuClose = document.getElementById('menu-close');
const navMenu = document.getElementById('nav-menu');

if (menuToggle && menuClose && navMenu) {
    menuToggle.addEventListener('click', () => {
        navMenu.classList.add('open');
    });

    menuClose.addEventListener('click', () => {
        navMenu.classList.remove('open');
    });
}

// Scroll to Top Function
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Optional: Change header background on scroll
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        header.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
    } else {
        header.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
    }
});

// Form Confirmation Logic
function showConfirm(formType) {
    const form = document.getElementById(formType + '-form');
    
    // HTML5 Validation
    if (!form.reportValidity()) {
        return;
    }

    // Map inputs to confirm view
    if (formType === 'recruit') {
        document.getElementById('confirm-recruit-name').textContent = document.getElementById('recruit-name').value;
        document.getElementById('confirm-recruit-email').textContent = document.getElementById('recruit-email').value;
        document.getElementById('confirm-recruit-message').textContent = document.getElementById('recruit-message').value;
    } else if (formType === 'contact') {
        document.getElementById('confirm-contact-name').textContent = document.getElementById('contact-name').value;
        document.getElementById('confirm-contact-email').textContent = document.getElementById('contact-email').value;
        document.getElementById('confirm-contact-category').textContent = document.getElementById('contact-category').value;
        document.getElementById('confirm-contact-message').textContent = document.getElementById('contact-message').value;
    }

    // Hide form, show confirm
    document.getElementById(formType + '-form-view').style.display = 'none';
    document.getElementById(formType + '-confirm-view').style.display = 'block';
}

function hideConfirm(formType) {
    document.getElementById(formType + '-form-view').style.display = 'block';
    document.getElementById(formType + '-confirm-view').style.display = 'none';
}

function submitForm(formType) {
    const form = document.getElementById(formType + '-form');
    form.submit();
}

// Custom Calendar Logic
let allEvents = [];
let currentCalDate = new Date(); // Date used for rendering calendar grid

// イベント詳細へのジャンプURL設定 (日付 YYYYMMDD をキーにする)
const EVENT_URLS = {
    '20260620': 'https://www.instagram.com/p/DZ3dA2YEkEB/?img_index=1',
    '20260624': 'https://www.instagram.com/p/DYvfMMhn3WR/?img_index=1',
    '20260710': 'https://www.instagram.com/p/DZo4kK0n00B/?img_index=1',
    '20260718': 'https://riverwalk.co.jp/event/challengeshop/',
    '20260725': 'https://www.instagram.com/p/DaVPnE2EliT/?img_index=2',
    '20260730': 'https://www.instagram.com/p/Dad6660Ekww/?img_index=1',
    '20260822': 'https://www.instagram.com/p/DaVPnE2EliT/?img_index=3',
    '20260829': 'https://www.instagram.com/p/DZHSypLH7kU/?img_index=1',
};

// Fetch events from Vercel API
async function fetchEvents() {
    try {
        const res = await fetch('/api/events');
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        allEvents = data;
        renderEventList();
        renderCalendar();
    } catch (err) {
        console.error(err);
        document.getElementById('custom-event-list').innerHTML = '<div class="text-center p-md" style="color: #ff7676;">予定の取得に失敗しました。</div>';
    }
}

// Fetch and render history events
async function fetchHistoryEvents() {
    try {
        const res = await fetch('/api/events?all=true');
        if (!res.ok) throw new Error('API Error');
        const data = await res.json();
        
        // Filter out future events to only show past events
        const now = new Date();
        const y = now.getFullYear();
        const m = now.getMonth() + 1;
        const d = now.getDate();
        const todayStr = y + String(m).padStart(2, '0') + String(d).padStart(2, '0');
        
        const pastEvents = data.filter(e => e.start < todayStr);
        // Sort descending (newest first)
        pastEvents.sort((a, b) => b.timestamp - a.timestamp);
        
        renderHistoryEventList(pastEvents);
    } catch (err) {
        console.error(err);
        document.getElementById('history-event-list').innerHTML = '<div class="text-center p-md" style="color: #ff7676;">過去の活動実績の取得に失敗しました。</div>';
    }
}

function renderHistoryEventList(events) {
    const listEl = document.getElementById('history-event-list');
    if (!listEl) return;
    
    if (events.length === 0) {
        listEl.innerHTML = '<div class="text-center p-md" style="color: #888;">過去の活動実績はまだありません。</div>';
        return;
    }
    
    listEl.innerHTML = '';
    
    events.forEach(e => {
        const dateStr = e.start.substring(0,8);
        const displayDate = `${dateStr.substring(0,4)}.${dateStr.substring(4,6)}.${dateStr.substring(6,8)}`;
        
        const item = document.createElement(EVENT_URLS[dateStr] ? 'a' : 'div');
        item.className = 'event-item';
        
        if (EVENT_URLS[dateStr]) {
            item.href = EVENT_URLS[dateStr];
            item.target = '_blank';
            item.rel = 'noopener';
            item.style.cssText = 'text-decoration: none; color: inherit; transition: opacity 0.2s; display: flex; align-items: center; gap: 16px; background: white; padding: 12px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);';
            item.onmouseover = function() { this.style.opacity = '0.8'; };
            item.onmouseout = function() { this.style.opacity = '1'; };
        } else {
            item.style.cssText = 'display: flex; align-items: center; gap: 16px; background: white; padding: 12px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);';
        }
        
        const imgSrc = getEventImage(e.title);
        
        item.innerHTML = `
            <img src="${imgSrc}" class="event-img" alt="イベント画像" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
            <div class="event-info">
                <div class="event-date" style="font-size: 0.85rem; color: #888; margin-bottom: 4px;">${displayDate} <span style="background-color: #f6ad55; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; margin-left: 8px;">活動実績</span></div>
                <h3 class="event-title" style="margin-bottom: 0; font-weight: bold; font-size: 1.1rem;">${EVENT_URLS[dateStr] ? '<i data-lucide="chevron-right-circle"></i> ' : ''}${e.title}</h3>
            </div>
        `;
        listEl.appendChild(item);
    });
    
    lucide.createIcons();
}

function getEventImage(title) {
    if (title.includes('スクイーズ') || title.includes('キーホルダー')) return './images/event_riverwalk.png';
    if (title.includes('谷口')) return './images/event_taniguchi.png';
    if (title.includes('祭り')) return './images/event_summer_festival.png';
    if (title.includes('赤ちゃん食堂')) return './images/event_baby_cafeteria.png';
    if (title.includes('子ども食堂') || title.includes('こども食堂') || title.includes('食堂')) return './images/event_cafeteria.png';
    if (title.includes('講座') || title.includes('教室')) return './images/event_lecture.png';
    if (title.includes('お話会') || title.includes('おはなし')) return './images/event_talk.png';
    if (title.includes('イベント') || title.includes('マルシェ') || title.includes('講演') || title.includes('コラボ')) return './images/thumbnail_event_1780984231383.png';
    return './images/thumbnail_other_1780984242886.png'; // その他
}

function renderEventList() {
    const listEl = document.getElementById('custom-event-list');
    listEl.innerHTML = '';
    
    // Sort events (only future/today)
    const now = new Date();
    const todayStr = now.getFullYear() + String(now.getMonth()+1).padStart(2, '0') + String(now.getDate()).padStart(2, '0');
    
    const upcoming = allEvents.filter(e => {
        return e.start.substring(0,8) >= todayStr;
    });

    if (upcoming.length === 0) {
        listEl.innerHTML = '<div class="text-center p-md" style="color: var(--color-text-light);">現在予定されているイベントはありません。</div>';
        return;
    }

    upcoming.forEach(e => {
        const dateKey = e.start.substring(0, 8);
        const item = document.createElement(EVENT_URLS[dateKey] ? 'a' : 'div');
        item.className = 'event-item';
        
        if (EVENT_URLS[dateKey]) {
            item.href = EVENT_URLS[dateKey];
            item.target = '_blank';
            item.rel = 'noopener';
            item.style.cssText = 'text-decoration: none; color: inherit; transition: opacity 0.2s;';
            item.onmouseover = function() { this.style.opacity = '0.8'; };
            item.onmouseout = function() { this.style.opacity = '1'; };
        }
        
        const imgSrc = getEventImage(e.title);
        
        let dateDisplay = e.start;
        if (e.start.length >= 8) {
            const y = e.start.substring(0,4);
            const m = parseInt(e.start.substring(4,6));
            const d = parseInt(e.start.substring(6,8));
            dateDisplay = `${y}年${m}月${d}日`;
        }

        item.innerHTML = `
            <img src="${imgSrc}" class="event-img" alt="イベント画像">
            <div class="event-info">
                <div class="event-date">${dateDisplay}</div>
                <div class="event-title"><i data-lucide="chevron-right-circle"></i> ${e.title}</div>
            </div>
        `;
        listEl.appendChild(item);
    });
    lucide.createIcons();
}

function renderCalendar() {
    const year = currentCalDate.getFullYear();
    const month = currentCalDate.getMonth(); // 0-indexed
    
    document.getElementById('cal-month-title').textContent = `${year}年${month + 1}月`;
    
    const cellsEl = document.getElementById('custom-calendar-cells');
    cellsEl.innerHTML = '';
    
    // Get days in month
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun, 6=Sat
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Fill empty cells before 1st
    for (let i = 0; i < firstDay; i++) {
        const cell = document.createElement('div');
        cell.className = 'cal-cell empty';
        cellsEl.appendChild(cell);
    }
    
    // Create cells for days
    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement('div');
        cell.className = 'cal-cell';
        cell.textContent = day;
        
        // Check if has event
        const mStr = String(month+1).padStart(2, '0');
        const dStr = String(day).padStart(2, '0');
        const dateStr = `${year}${mStr}${dStr}`;
        
        const dayEvents = allEvents.filter(e => e.start.startsWith(dateStr));
        if (dayEvents.length > 0) {
            cell.classList.add('has-event');
            cell.title = dayEvents.map(e => e.title).join('\n');
            
            if (EVENT_URLS[dateStr]) {
                cell.style.cursor = 'pointer';
                cell.onclick = () => window.open(EVENT_URLS[dateStr], '_blank', 'noopener');
            }
        }
        
        cellsEl.appendChild(cell);
    }
}

// Navigation Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initial routing based on URL hash
    const hash = window.location.hash.replace('#', '');
    
    if (hash === 'events') {
        navigateTo('home', false, 'events');
        history.replaceState({ pageId: 'home', targetSectionId: 'events' }, '', '#events');
    } else if (hash && document.getElementById('page-' + hash)) {
        navigateTo(hash, false);
        history.replaceState({ pageId: hash, targetSectionId: null }, '', '#' + hash);
    } else {
        history.replaceState({ pageId: 'home', targetSectionId: null }, '', '#home');
        // Ensure home is visible
        navigateTo('home', false);
    }

    const prevBtn = document.getElementById('cal-prev');
    const nextBtn = document.getElementById('cal-next');
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentCalDate.setMonth(currentCalDate.getMonth() - 1);
            renderCalendar();
        });
        nextBtn.addEventListener('click', () => {
            currentCalDate.setMonth(currentCalDate.getMonth() + 1);
            renderCalendar();
        });
    }

    // Initialize calendar fetch if element exists
    if (document.getElementById('custom-event-list')) {
        fetchEvents();
    }
    
    // Fetch Note articles
    if (document.getElementById('note-blog-grid')) {
        fetchNoteArticles();
    }
});

// Fetch Note Articles
async function fetchNoteArticles() {
    try {
        const res = await fetch('/api/note');
        if (!res.ok) throw new Error('Note API Error');
        const data = await res.json();
        
        const gridEl = document.getElementById('note-blog-grid');
        if (!gridEl) return;
        
        let allItems = [];
        const nowMs = new Date().getTime();
        
        // 1. Collect manual announcements
        document.querySelectorAll('.manual-news-item').forEach(item => {
            const pubDateStr = item.getAttribute('data-publish-date');
            if (pubDateStr) {
                const pubDate = new Date(pubDateStr).getTime();
                const daysPassed = (nowMs - pubDate) / (1000 * 60 * 60 * 24);
                if (daysPassed < 7) {
                    item.style.display = 'flex'; // Ensure it's visible if it was hidden
                    allItems.push({
                        element: item,
                        pubDate: pubDate
                    });
                }
            }
        });
        
        // 2. Fetch and collect note articles
        if (data.data && data.data.contents && data.data.contents.length > 0) {
            const noteContents = data.data.contents.slice(0, 3);
            noteContents.forEach(item => {
                const pubDate = new Date(item.publishAt).getTime();
                const daysPassed = (nowMs - pubDate) / (1000 * 60 * 60 * 24);
                if (daysPassed < 7) {
                    let imgSrc = item.eyecatch || 'images/members_cover.png';
                    
                    const d = new Date(item.publishAt);
                    const dateStr = `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
                    
                    const card = document.createElement('a');
                    card.href = item.noteUrl;
                    card.target = '_blank';
                    card.rel = 'noopener';
                    card.className = 'event-item';
                    card.style.cssText = 'text-decoration: none; color: inherit; transition: opacity 0.2s; display: flex; align-items: center; gap: 16px; background: white; padding: 12px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);';
                    card.onmouseover = function() { this.style.opacity = '0.8'; };
                    card.onmouseout = function() { this.style.opacity = '1'; };
                    
                    card.innerHTML = `
                        <img src="${imgSrc}" class="event-img" alt="ブログ画像" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div style="width: 80px; height: 80px; background-color: #fcf8ec; display: none; align-items: center; justify-content: center; border-radius: 8px; color: #e0d5b5; flex-shrink: 0;"><i data-lucide="image" style="width: 24px; height: 24px;"></i></div>
                        
                        <div class="event-info">
                            <div class="event-date" style="font-size: 0.85rem; color: #888; margin-bottom: 4px;">${dateStr} <span style="background-color: #41c9b4; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; margin-left: 8px;">note</span></div>
                            <h3 class="event-title" style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0;"><i data-lucide="chevron-right-circle"></i> ${item.name}</h3>
                        </div>
                    `;
                    
                    allItems.push({
                        element: card,
                        pubDate: pubDate
                    });
                }
            });
        }
        
        // 3. Sort by date descending (newest first)
        allItems.sort((a, b) => b.pubDate - a.pubDate);
        
        // 4. Clear grid and append sorted items
        gridEl.innerHTML = '';
        allItems.forEach(item => {
            gridEl.appendChild(item.element);
        });
        
        lucide.createIcons();
    } catch (err) {
        console.error('Failed to fetch Note RSS:', err);
        // Leave dummy articles on failure
    }
}
