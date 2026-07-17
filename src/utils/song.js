export function normalizeSong(song) {
  if (!song) return null
  
  const normalized = {
    id: song.id || song.songId || song.songid || song.song_id || 0,
    name: song.name || song.title || song.songName || song.song_name || song.songname || '未知歌曲',
    artist: song.artist || song.singer || song.artistName || song.artist_name || song.singerName || '未知歌手',
    album: song.album || song.albumName || song.album_name || '未知专辑',
    coverUrl: song.coverUrl || song.cover_url || song.imgUrl || song.imageUrl || song.pic || song.picUrl || song.cover || '',
    audioUrl: song.audioUrl || song.audio_url || song.url || song.songUrl || song.song_url || song.playUrl || '',
    duration: song.duration || song.dur || song.songDuration || 0,
    plays: song.plays || song.playCount || song.play_count || 0,
    isHot: song.isHot || song.hot || false,
    source: song.source || ''
  }
  
  if (typeof normalized.duration === 'string') {
    normalized.duration = parseInt(normalized.duration) || 0
  }
  
  if (!normalized.coverUrl) {
    const picId = song.pic_id || song.picid
    if (picId) {
      normalized.coverUrl = `https://p1.music.126.net/${picId}/10995116${picId}.jpg`
    }
  }
  
  if (!normalized.coverUrl && normalized.id) {
    normalized.coverUrl = `https://p1.music.126.net/${normalized.id}/10995116${normalized.id}.jpg`
  }
  
  if (!normalized.coverUrl) {
    normalized.coverUrl = 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=music%20album%20cover%20abstract%20gradient&image_size=square'
  }
  
  return normalized
}

export function normalizeSongList(songs) {
  if (!Array.isArray(songs)) return []
  return songs.map(normalizeSong).filter(Boolean)
}