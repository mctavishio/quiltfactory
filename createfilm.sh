ffmpeg -f concat -safe 0 -i quiltfiles.txt -c copy film$(date "+%s").mp4
