ffmpeg -framerate 24 -pattern_type glob -i 'q*all.png'  -c:v libx264 -r 24 -pix_fmt yuv420p film.mp4
ffmpeg -f concat -safe 0 -i filmfiles.txt -c copy film$(date "+%s").mp4
