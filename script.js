// Initialize Lucide Icons
lucide.createIcons();

// Navigation Function (SPA Routing)
function navigateTo(pageId) {
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

    // Scroll to top
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

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

function getEventImage(title) {
    if (title.includes('食堂')) return './images/thumbnail_cafeteria_1780984186941.png';
    if (title.includes('講座') || title.includes('教室')) return './images/thumbnail_lecture_1780984200662.png';
    if (title.includes('お話会') || title.includes('おはなし')) return './images/thumbnail_talk_1780984211936.png';
    if (title.includes('イベント') || title.includes('祭り') || title.includes('マルシェ') || title.includes('講演') || title.includes('コラボ')) return './images/thumbnail_event_1780984231383.png';
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
        const item = document.createElement('div');
        item.className = 'event-item';
        
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
        }
        
        cellsEl.appendChild(cell);
    }
}

// Navigation Listeners
document.addEventListener('DOMContentLoaded', () => {
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
    const noteId = 'irodori_fukuoka';
    const rssUrl = `https://note.com/${noteId}/rss`;
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
    
    try {
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error('Note API Error');
        const data = await res.json();
        
        const gridEl = document.getElementById('note-blog-grid');
        if (!gridEl) return;
        
        if (data.status === 'ok' && data.items && data.items.length > 0) {
            gridEl.innerHTML = ''; // Clear dummy content
            
            // Render up to 3 articles
            const items = data.items.slice(0, 3);
            items.forEach(item => {
                // Extract image (Note RSS usually provides thumbnail)
                let imgSrc = item.thumbnail || 'images/members_cover.png';
                
                // Format date (YYYY.MM.DD)
                const d = new Date(item.pubDate);
                const dateStr = `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
                
                const card = document.createElement('a');
                card.href = item.link;
                card.target = '_blank';
                card.rel = 'noopener';
                card.className = 'blog-card';
                card.style.cssText = 'display: block; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); text-decoration: none; transition: transform 0.2s, box-shadow 0.2s;';
                
                card.innerHTML = `
                    <div class="blog-img-wrapper" style="width: 100%; aspect-ratio: 16/9; background-color: #fcf8ec; overflow: hidden; display: flex; align-items: center; justify-content: center; color: #e0d5b5;">
                        <img src="${imgSrc}" alt="ブログ画像" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                        <i data-lucide="image" style="width: 48px; height: 48px; display: none;"></i>
                    </div>
                    <div class="blog-content" style="padding: 16px;">
                        <div class="blog-date" style="font-size: 0.85rem; color: #888; margin-bottom: 8px;">${dateStr}</div>
                        <h3 class="blog-title" style="font-size: 1.05rem; color: var(--color-text); margin-bottom: 0; line-height: 1.5; font-weight: 700;">${item.title}</h3>
                    </div>
                `;
                gridEl.appendChild(card);
            });
            lucide.createIcons();
        } else if (data.status === 'ok') {
            // Keep dummy or show empty state if no items
            gridEl.innerHTML = `
                <div class="text-center p-md" style="grid-column: 1 / -1; color: var(--color-text-light);">
                    現在、新しい記事を準備中です。お楽しみに！
                </div>
            `;
        }
    } catch (err) {
        console.error('Failed to fetch Note RSS:', err);
        // Leave dummy articles on failure
    }
}
