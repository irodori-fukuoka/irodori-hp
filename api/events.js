module.exports = async (req, res) => {
  try {
    const url = "https://calendar.google.com/calendar/ical/irodori.hokenshitsu%40gmail.com/public/basic.ics";
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch iCal data: ${response.status}`);
    }
    const icsData = await response.text();
    
    // Simple ICS parser
    const events = [];
    const lines = icsData.split(/\r?\n/);
    let currentEvent = null;
    let currentKey = null;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      // Handle folded lines
      if (line.startsWith(' ') || line.startsWith('\t')) {
        if (currentKey && currentEvent) {
          currentEvent[currentKey] += line.substring(1);
        }
        continue;
      }

      const separatorIndex = line.indexOf(':');
      if (separatorIndex === -1) continue;

      const keyPart = line.substring(0, separatorIndex);
      const value = line.substring(separatorIndex + 1);
      
      const key = keyPart.split(';')[0];
      currentKey = key;

      if (key === 'BEGIN' && value === 'VEVENT') {
        currentEvent = {};
      } else if (key === 'END' && value === 'VEVENT') {
        if (currentEvent) {
          events.push(currentEvent);
          currentEvent = null;
        }
      } else if (currentEvent) {
        currentEvent[key] = value;
      }
    }

    // Process events
    const processedEvents = events.map(e => {
      let startStr = e.DTSTART || '';
      let dateObj = null;
      if (startStr.length >= 8) {
        const year = startStr.substring(0,4);
        const month = startStr.substring(4,6);
        const day = startStr.substring(6,8);
        dateObj = new Date(Date.UTC(year, parseInt(month) - 1, parseInt(day)));
      }

      // 簡易的なエスケープ解除
      let title = (e.SUMMARY || '予定あり').replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\');

      return {
        title: title,
        start: startStr,
        timestamp: dateObj ? dateObj.getTime() : 0,
        year: dateObj ? dateObj.getUTCFullYear() : 0,
        month: dateObj ? dateObj.getUTCMonth() + 1 : 0,
        day: dateObj ? dateObj.getUTCDate() : 0
      };
    }).sort((a, b) => a.timestamp - b.timestamp);

    // 今日以降のイベントのみフィルタリング
    const now = new Date();
    // 日本時間の今日の0時
    const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())).getTime();
    
    // カレンダー描画用に少し過去のイベントも返す（今月のカレンダー表示用）
    // とりあえず1ヶ月前からのデータを送る
    const oneMonthAgo = new Date(Date.UTC(now.getFullYear(), now.getMonth() - 1, 1)).getTime();
    const upcomingEvents = processedEvents.filter(e => e.timestamp >= oneMonthAgo);

    res.status(200).json(upcomingEvents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
