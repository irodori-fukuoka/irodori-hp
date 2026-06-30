export default async function handler(req, res) {
    try {
        const fetchRes = await fetch('https://note.com/api/v2/creators/irodori_fukuoka/contents?kind=note&page=1');
        const data = await fetchRes.json();
        
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate'); // 1 min cache
        res.status(200).json(data);
    } catch (error) {
        console.error('Note API error:', error);
        res.status(500).json({ error: 'Failed to fetch note articles' });
    }
}
