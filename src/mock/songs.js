export const mockSongs = [
  {
    id: 1,
    name: '电子音乐1',
    artist: 'SoundHelix',
    album: 'Demo Album',
    coverUrl: 'https://images.unsplash.com/photo-1493225297732-0f69519d5689?w=400&h=400&fit=crop',
    audioUrl: '/music/song1.mp3',
    duration: 300,
    plays: 200000,
    isHot: true
  },
  {
    id: 2,
    name: '电子音乐2',
    artist: 'SoundHelix',
    album: 'Demo Album',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
    audioUrl: '/music/song2.mp3',
    duration: 280,
    plays: 150000,
    isHot: true
  },
  {
    id: 3,
    name: '电子音乐3',
    artist: 'SoundHelix',
    album: 'Demo Album',
    coverUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=400&fit=crop',
    audioUrl: '/music/song3.mp3',
    duration: 260,
    plays: 120000,
    isHot: false
  },
  {
    id: 4,
    name: '电子音乐4',
    artist: 'SoundHelix',
    album: 'Demo Album',
    coverUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=400&fit=crop',
    audioUrl: '/music/song4.mp3',
    duration: 270,
    plays: 100000,
    isHot: false
  },
  {
    id: 5,
    name: '电子音乐5',
    artist: 'SoundHelix',
    album: 'Demo Album',
    coverUrl: 'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=400&h=400&fit=crop',
    audioUrl: '/music/song5.mp3',
    duration: 250,
    plays: 90000,
    isHot: false
  },
  {
    id: 6,
    name: '电子音乐6',
    artist: 'SoundHelix',
    album: 'Demo Album',
    coverUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop',
    audioUrl: '/music/song6.mp3',
    duration: 240,
    plays: 85000,
    isHot: false
  },
  {
    id: 7,
    name: '电子音乐7',
    artist: 'SoundHelix',
    album: 'Demo Album',
    coverUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=400&fit=crop',
    audioUrl: '/music/song7.mp3',
    duration: 230,
    plays: 80000,
    isHot: false
  },
  {
    id: 8,
    name: '电子音乐8',
    artist: 'SoundHelix',
    album: 'Demo Album',
    coverUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=400&fit=crop',
    audioUrl: '/music/song8.mp3',
    duration: 220,
    plays: 75000,
    isHot: false
  },
  {
    id: 9,
    name: '电子音乐9',
    artist: 'SoundHelix',
    album: 'Demo Album',
    coverUrl: 'https://images.unsplash.com/photo-1496307655369-37a45ed580c3?w=400&h=400&fit=crop',
    audioUrl: '/music/song9.mp3',
    duration: 225,
    plays: 70000,
    isHot: false
  },
  {
    id: 10,
    name: '电子音乐10',
    artist: 'SoundHelix',
    album: 'Demo Album',
    coverUrl: 'https://images.unsplash.com/photo-1505673542862-770b6f24f629?w=400&h=400&fit=crop',
    audioUrl: '/music/song10.mp3',
    duration: 235,
    plays: 65000,
    isHot: false
  },
  {
    id: 11,
    name: '电子音乐11',
    artist: 'SoundHelix',
    album: 'Demo Album',
    coverUrl: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=400&fit=crop',
    audioUrl: '/music/song11.mp3',
    duration: 245,
    plays: 60000,
    isHot: false
  },
  {
    id: 12,
    name: '电子音乐12',
    artist: 'SoundHelix',
    album: 'Demo Album',
    coverUrl: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=400&fit=crop',
    audioUrl: '/music/song12.mp3',
    duration: 255,
    plays: 55000,
    isHot: false
  }
]

export function getMockHotSongs() {
  return mockSongs.filter(song => song.isHot)
}

export function getMockAllSongs() {
  return mockSongs
}

export function searchMockSongs(keyword) {
  if (!keyword) return mockSongs
  const lowerKeyword = keyword.toLowerCase()
  return mockSongs.filter(song => 
    song.name.toLowerCase().includes(lowerKeyword) ||
    song.artist.toLowerCase().includes(lowerKeyword) ||
    song.album.toLowerCase().includes(lowerKeyword)
  )
}

export function getMockSongById(id) {
  return mockSongs.find(song => song.id === id)
}