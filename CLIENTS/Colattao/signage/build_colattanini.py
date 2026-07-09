#!/usr/bin/env python3
# Colattanini collector sheet, Draft 1. 5x7@300 + bleed. Character art = placeholder ball emblems.
import math, qrcode
from PIL import Image, ImageDraw, ImageFont, ImageFilter

BASE = r"C:\Users\antho\OneDrive\Desktop\AMMA Ventures LLC DBA Fina Calle"
FONTS = r"C:\Users\antho\AppData\Roaming\Claude\local-agent-mode-sessions\skills-plugin\24cce8aa-cc4c-484b-8f99-a3994cdc24d2\31256114-c4fa-4d90-82d2-9e799eca2564\skills\canvas-design\canvas-fonts"
OUT = BASE + r"\CLIENTS\Colattao\signage"
URL = "https://finacalleos.com/penalty-shootout"   # TODO: swap to /play/colattao after game Phase A

EMBER=(12,7,5); GOLD=(216,179,109); GOLD_HI=(244,217,156); CREAM=(255,247,234); BODY=(206,196,180); MUTED=(150,134,112); QRDARK=(20,13,9)
BLEED=38; TW,TH=1500,2100; W,H=TW+2*BLEED,TH+2*BLEED; CX=W//2
T_TOP,T_LEFT,T_RIGHT,T_BOT=BLEED,BLEED,BLEED+TW,BLEED+TH

def f(n,s): return ImageFont.truetype(FONTS+"\\"+n,s)
def tw(d,t,ft,tr):
    w=0
    for c in t:
        b=d.textbbox((0,0),c,font=ft); w+=(b[2]-b[0])+tr
    return w-tr if t else 0
def tr_c(d,t,ft,fill,cx,y,trk):
    x=cx-tw(d,t,ft,trk)/2
    for c in t:
        d.text((x,y),c,font=ft,fill=fill); b=d.textbbox((0,0),c,font=ft); x+=(b[2]-b[0])+trk

def ball(d,cx,cy,r):
    d.ellipse([cx-r,cy-r,cx+r,cy+r],fill=CREAM,outline=GOLD,width=4)
    pr=r*0.40; pts=[(cx+pr*math.sin(math.radians(72*i)), cy-pr*math.cos(math.radians(72*i))) for i in range(5)]
    d.polygon(pts,outline=QRDARK)
    for i in range(5): d.line([pts[i],pts[(i+2)%5]],fill=(60,45,32),width=2)
    for px,py in pts:
        ang=math.atan2(py-cy,px-cx); d.line([(px,py),(cx+ r*0.92*math.cos(ang), cy+ r*0.92*math.sin(ang))],fill=(60,45,32),width=2)

img=Image.new("RGBA",(W,H),EMBER+(255,))
g=Image.new("L",(W,H),0); gd=ImageDraw.Draw(g); gd.ellipse([CX-560,T_TOP+40,CX+560,T_TOP+1160],fill=110)
g=g.filter(ImageFilter.GaussianBlur(300)); img=Image.composite(Image.new("RGBA",(W,H),(70,39,17,255)),img,g)
d=ImageDraw.Draw(img)

# frame
ov=Image.new("RGBA",(W,H),(0,0,0,0)); od=ImageDraw.Draw(ov)
fr=[T_LEFT+96,T_TOP+96,T_RIGHT-96,T_BOT-96]; od.rounded_rectangle(fr,radius=18,outline=GOLD+(80,),width=2)
for (px,py,sx,sy) in [(fr[0],fr[1],1,1),(fr[2],fr[1],-1,1),(fr[0],fr[3],1,-1),(fr[2],fr[3],-1,-1)]:
    od.line([px,py,px+sx*26,py],fill=GOLD_HI+(200,),width=3); od.line([px,py,px,py+sy*26],fill=GOLD_HI+(200,),width=3)
img=Image.alpha_composite(img,ov); d=ImageDraw.Draw(img)

y=T_TOP+150
tr_c(d,"COLATTAO  COLLECTION",f("DMMono-Regular.ttf",24),MUTED,CX,y,10); y+=58
d.text((CX,y),"Colattaninis",font=f("Gloock-Regular.ttf",104),fill=CREAM,anchor="ma"); y+=150
tr_c(d,"PLAY  ·  WIN  ·  COLLECT",f("ArsenalSC-Regular.ttf",40),GOLD_HI,CX,y,6); y+=92
tr_c(d,"SCAN  ·  PLAY 5 SHOTS  ·  WIN YOUR COLATTANINI",f("DMMono-Regular.ttf",24),BODY,CX,y,3); y+=70
d.line([CX-90,y,CX+90,y],fill=GOLD,width=2); d.ellipse([CX-4,y-4,CX+4,y+4],fill=GOLD_HI); y+=70

STICK = BASE + r"\CLIENTS\Colattao\colattanini"
chars=[("STREET","Churro Latte","churro_latte_sticker.png"),
       ("CLUB","Coco Beach","coco_beach_sticker.png"),
       ("PRO","California Sandwich","california_sandwich_sticker.png")]
cols=3; gap=40; cw=(TW-2*40-(cols-1)*gap)//cols; r=cw//2-14
row_cx=[T_LEFT+40+cw//2+i*(cw+gap) for i in range(cols)]
medal_cy=y+r+8
sticker_h=int(2*r*1.04)
fl=f("ArsenalSC-Regular.ttf",30); fnm=f("CrimsonPro-Bold.ttf",34)
for i,(lvl,name,fn_) in enumerate(chars):
    cxx=row_cx[i]
    st=Image.open(STICK+"\\"+fn_).convert("RGBA")
    sw=int(st.width*sticker_h/st.height); st=st.resize((sw,sticker_h),Image.LANCZOS)
    img.paste(st,(cxx-sw//2, medal_cy-sticker_h//2), st)
    cyl=medal_cy+r+22
    tr_c(d,lvl,fl,GOLD_HI,cxx,cyl,4); cyl+=48
    words=name.split(); lines=[]; cur=""
    for w_ in words:
        t=(cur+" "+w_).strip()
        if d.textlength(t,font=fnm)<=cw: cur=t
        else: lines.append(cur); cur=w_
    if cur: lines.append(cur)
    for ln in lines:
        d.text((cxx,cyl),ln,font=fnm,fill=CREAM,anchor="ma"); cyl+=42
y=medal_cy+r+22+48+92+24

# QR panel
P=440; QS=340; px=CX-P//2; py=y
sh=Image.new("RGBA",(W,H),(0,0,0,0)); sd=ImageDraw.Draw(sh)
sd.rounded_rectangle([px,py+12,px+P,py+P+12],radius=30,fill=(0,0,0,150)); sh=sh.filter(ImageFilter.GaussianBlur(26))
img.alpha_composite(sh); d=ImageDraw.Draw(img)
d.rounded_rectangle([px,py,px+P,py+P],radius=30,fill=CREAM)
d.rounded_rectangle([px+10,py+10,px+P-10,py+P-10],radius=22,outline=GOLD,width=3)
qr=qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_Q,box_size=10,border=0); qr.add_data(URL); qr.make(fit=True)
qim=qr.make_image(fill_color=QRDARK,back_color=CREAM).convert("RGB").resize((QS,QS),Image.NEAREST)
img.paste(qim,(CX-QS//2,py+(P-QS)//2)); d=ImageDraw.Draw(img)
y=py+P+58
tr_c(d,"SCAN TO PLAY",f("ArsenalSC-Regular.ttf",38),CREAM,CX,y,6); y+=64
tr_c(d,"COLLECT ALL THREE — ASK STAFF FOR YOUR REWARD",f("DMMono-Regular.ttf",20),GOLD,CX,y,2)

tr_c(d,"POWERED BY FINA CALLE OS",f("DMMono-Regular.ttf",20),MUTED,CX,T_BOT-92,8)

rgb=img.convert("RGB")
p=OUT+r"\colattanini_collector_draft1.png"; pdf=OUT+r"\colattanini_collector_draft1_print.pdf"
rgb.save(p,"PNG"); rgb.save(pdf,"PDF",resolution=300.0)
print("PNG:",p); print("PDF:",pdf); print("qr_url:",URL,"bottom_y:",y,"of",H)
