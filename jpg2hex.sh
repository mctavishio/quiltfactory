#convert *.jpg -gravity center -crop 1x1+0+0 -format "%f,%[fx:int(mean.r*255)],%[fx:int(mean.g*255)],%[fx:int(mean.b*255)]\n" info > info.txt:
#https://color-hex.org/color/951e22
#https://color.adobe.com/create/image-gradient
for file in *.jpg; do magick convert $file  -set filename:fn "%t_#%[hex:u.p{100,100}].%e" "%[filename:fn]"; done;

