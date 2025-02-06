from yt_dlp import YoutubeDL

ydl_opts = {
    'format': 'bestaudio/best',
    'postprocessors': [
        {
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        },
        {
            'key': 'FFmpegMetadata',
        },
    ],
}

with YoutubeDL(ydl_opts) as ydl:
    ydl.download(['https://www.youtube.com/watch?v=Co7t31kSeFk'])
    #https://www.youtube.com/watch?v=Co7t31kSeFk
    # https://www.youtube.com/watch?v=lqBvPwoEMQo