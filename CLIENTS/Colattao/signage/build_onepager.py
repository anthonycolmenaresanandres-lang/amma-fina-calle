#!/usr/bin/env python3
# Fina Calle OS — product one-pager, Draft 1. Letter 8.5x11 @200dpi (1700x2200).
from PIL import Image, ImageDraw, ImageFont, ImageFilter

BASE = r"C:\Users\antho\OneDrive\Desktop\AMMA Ventures LLC DBA Fina Calle"
FONTS = r"C:\Users\antho\AppData\Roaming\Claude\local-agent-mode-sessions\skills-plugin\24cce8aa-cc4c-484b-8f99-a3994cdc24d2\31256114-c4fa-4d90-82d2-9e799eca2564\skills\canvas-design\canvas-fonts"
OUT = BASE + r"\CLIENTS\Colattao\signage"

EMBER=(12,7,5); GOLD=(216,179,109); GOLD_HI=(244,217,156); CREAM=(255,247,234); BODY=(206,196,180); MUTED=(150,134,112)
W,H = 1700,2200
CX = W//2
M = 150  # margin

def f(name,size): return ImageFont.truetype(FONTS+"\\"+name,size)
def tw(d,t,ft,tr):
    w=0
    for c in t:
        b=d.textbbox((0,0),c,font=ft); w+=(b[2]-b[0])+tr
    return w-tr if t else 0
def tracked(d,t,ft,fill,x,y,tr):
    for c in t:
        d.text((x,y),c,font=ft,fill=fill); b=d.textbbox((0,0),c,font=ft); x+=(b[2]-b[0])+tr
def tracked_c(d,t,ft,fill,cx,y,tr): tracked(d,t,ft,fill,cx-tw(d,t,ft,tr)/2,y,tr)
def wrap(d,t,ft,maxw):
    words=t.split(); lines=[]; cur=""
    for w_ in words:
        test=(cur+" "+w_).strip()
        if d.textlength(test,font=ft)<=maxw: cur=test
        else: lines.append(cur); cur=w_
    if cur: lines.append(cur)
    return lines

img = Image.new("RGBA",(W,H),EMBER+(255,))
# top glow
g=Image.new("L",(W,H),0); gd=ImageDraw.Draw(g); gd.ellipse([CX-560,-260,CX+560,560],fill=120)
g=g.filter(ImageFilter.GaussianBlur(300))
img=Image.composite(Image.new("RGBA",(W,H),(70,39,17,255)),img,g)
d=ImageDraw.Draw(img)

# inner frame
fr=[80,80,W-80,H-80]
ov=Image.new("RGBA",(W,H),(0,0,0,0)); od=ImageDraw.Draw(ov)
od.rectangle(fr,outline=GOLD+(70,),width=2)
for (px,py,sx,sy) in [(fr[0],fr[1],1,1),(fr[2],fr[1],-1,1),(fr[0],fr[3],1,-1),(fr[2],fr[3],-1,-1)]:
    od.line([px,py,px+sx*26,py],fill=GOLD_HI+(200,),width=3); od.line([px,py,px,py+sy*26],fill=GOLD_HI+(200,),width=3)
img=Image.alpha_composite(img,ov); d=ImageDraw.Draw(img)

y=M+30
tracked_c(d,"PRODUCT  ·  ONE-PAGER",f("DMMono-Regular.ttf",22),MUTED,CX,y,8); y+=70
d.text((CX,y), "Fina Calle OS", font=f("Gloock-Regular.ttf",118), fill=CREAM, anchor="ma"); y+=160
tracked_c(d,"THE CAFÉ, RUN FROM YOUR PHONE",f("ArsenalSC-Regular.ttf",40),GOLD_HI,CX,y,6); y+=78
# subline
sub="Your menu, your game, your customers — one system that goes live the day you sign."
for ln in wrap(d,sub,f("CrimsonPro-Regular.ttf",34),W-2*M-40):
    d.text((CX,y),ln,font=f("CrimsonPro-Regular.ttf",34),fill=BODY,anchor="ma"); y+=46
y+=34
d.line([CX-70,y,CX+70,y],fill=GOLD,width=2); d.ellipse([CX-4,y-4,CX+4,y+4],fill=GOLD_HI); y+=58
tracked_c(d,"WHAT YOU GET",f("DMMono-Regular.ttf",24),MUTED,CX,y,10); y+=66

pieces=[
 ("01","Live QR Menu","Your real menu on every table. Change a price or 86 an item in seconds."),
 ("02","AI Request Desk","Ask for any change in plain words — preview, confirm, live before your coffee’s poured."),
 ("03","Owner Dashboard","Prices, photos, availability, campaigns — fully in your control, every change audited."),
 ("04","Penalty Shootout","A branded counter game that keeps customers engaged while they wait."),
 ("05","Colattanini Collectibles","Play, win, collect three characters — a reason to return. No app, no data."),
]
fn=f("CrimsonPro-Bold.ttf",44); fnum=f("Gloock-Regular.ttf",46); fv=f("BricolageGrotesque-Regular.ttf",30)
lx=M+40; tx=lx+118
for num,name,val in pieces:
    d.text((lx,y-4),num,font=fnum,fill=GOLD)
    d.text((tx,y),name,font=fn,fill=CREAM)
    yy=y+58
    for ln in wrap(d,val,fv,W-tx-M-20):
        d.text((tx,yy),ln,font=fv,fill=BODY); yy+=40
    y=max(yy,y+58)+30
    d.line([lx,y-12,W-M-20,y-12],fill=(255,255,255,18),width=1)

y+=18
tracked_c(d,"PACKAGES",f("DMMono-Regular.ttf",24),MUTED,CX,y,10); y+=58
tiers=[("STARTER","QR menu + dashboard","Be live today."),
       ("PRO","+ AI Request Desk + campaigns","Run it from your phone."),
       ("SIGNATURE","+ Game + Colattanini","Turn waiting into play.")]
colw=(W-2*M)//3
for i,(tn,inc,tag) in enumerate(tiers):
    cxx=M+colw*i+colw//2
    tracked_c(d,tn,f("ArsenalSC-Regular.ttf",36),GOLD_HI,cxx,y,4)
    for j,ln in enumerate(wrap(d,inc,f("BricolageGrotesque-Regular.ttf",26),colw-40)):
        d.text((cxx,y+56+j*36),ln,font=f("BricolageGrotesque-Regular.ttf",26),fill=BODY,anchor="ma")
    d.text((cxx,y+150),tag,font=f("CrimsonPro-Italic.ttf",28),fill=MUTED,anchor="ma")
    d.text((cxx,y+196),"from $—/mo",font=f("DMMono-Regular.ttf",24),fill=GOLD,anchor="ma")
    if i<2: d.line([M+colw*(i+1),y+10,M+colw*(i+1),y+210],fill=(255,255,255,22),width=1)
y+=250

tracked_c(d,"FINACALLEOS.COM   ·   BUILT BY AMMA VENTURES",f("DMMono-Regular.ttf",22),MUTED,CX,H-M-6,6)

rgb=img.convert("RGB")
p=OUT+r"\finacalleos_onepager_draft1.png"; pdf=OUT+r"\finacalleos_onepager_draft1_print.pdf"
rgb.save(p,"PNG"); rgb.save(pdf,"PDF",resolution=200.0)
print("PNG:",p); print("PDF:",pdf); print("bottom_y:",y,"of",H)
