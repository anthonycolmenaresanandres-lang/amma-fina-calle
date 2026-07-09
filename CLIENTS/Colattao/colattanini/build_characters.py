#!/usr/bin/env python3
# Colattanini character concepts — flat-vector mascots drawn in code (Draft 1).
# Real items: Churro Latte, Coco Beach, California Sandwich. Non-human food/drink mascots.
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

BASE = r"C:\Users\antho\OneDrive\Desktop\AMMA Ventures LLC DBA Fina Calle"
FONTS = r"C:\Users\antho\AppData\Roaming\Claude\local-agent-mode-sessions\skills-plugin\24cce8aa-cc4c-484b-8f99-a3994cdc24d2\31256114-c4fa-4d90-82d2-9e799eca2564\skills\canvas-design\canvas-fonts"
OUT = BASE + r"\CLIENTS\Colattao\colattanini"

EMBER=(12,7,5); GOLD=(216,179,109); GOLD_HI=(244,217,156); CREAM=(255,247,234); BODY=(206,196,180); MUTED=(150,134,112)
LIMB=(58,42,32); EYE=(28,18,12); FOAM=(255,247,234)
W,H=1800,1180; CX=W//2

def f(n,s): return ImageFont.truetype(FONTS+"\\"+n,s)
def tw(d,t,ft,tr):
    w=0
    for c in t: b=d.textbbox((0,0),c,font=ft); w+=(b[2]-b[0])+tr
    return w-tr if t else 0
def tr_c(d,t,ft,fill,cx,y,trk):
    x=cx-tw(d,t,ft,trk)/2
    for c in t: d.text((x,y),c,font=ft,fill=fill); b=d.textbbox((0,0),c,font=ft); x+=(b[2]-b[0])+trk

def limb(d,p1,p2,w,col):
    d.line([p1,p2],fill=col,width=w); r=w//2
    for p in (p1,p2): d.ellipse([p[0]-r,p[1]-r,p[0]+r,p[1]+r],fill=col)
def shoe(d,p,col=(34,24,18)): d.ellipse([p[0]-26,p[1]-12,p[0]+26,p[1]+12],fill=col)
def face(d,cx,cy,sp=30):
    for ex in (cx-sp,cx+sp):
        d.ellipse([ex-12,cy-14,ex+12,cy+14],fill=EYE); d.ellipse([ex-3,cy-9,ex+4,cy-2],fill=CREAM)
    d.arc([cx-22,cy+10,cx+22,cy+40],20,160,fill=EYE,width=5)
    for bx in (cx-46,cx+46): d.ellipse([bx-10,cy+16,bx+10,cy+30],fill=(233,160,107))
def ball(d,cx,cy,r):
    d.ellipse([cx-r,cy-r,cx+r,cy+r],fill=CREAM,outline=LIMB,width=3)
    pts=[(cx+r*0.4*math.sin(math.radians(72*i)),cy-r*0.4*math.cos(math.radians(72*i))) for i in range(5)]
    d.polygon(pts,fill=(40,30,22))
def shadow(d,cx,base):
    d.ellipse([cx-120,base-18,cx+120,base+18],fill=(0,0,0,90))

# ---- mascots (cx, feet baseline) ----
def latte(d,cx,base):
    top=base-470; bot=base-170
    d.polygon([(cx-98,top),(cx+98,top),(cx+82,bot),(cx-82,bot)],fill=(243,231,211))
    d.rounded_rectangle([cx-92,top+150,cx+92,top+210],radius=12,fill=(150,95,55))  # sleeve
    d.ellipse([cx-105,top-46,cx+105,top+46],fill=FOAM)  # foam
    for dx,dy in [(-40,-6),(0,-18),(38,-4),(-12,8),(24,12)]: d.ellipse([cx+dx-7,top+dy-7,cx+dx+7,top+dy+7],fill=(150,95,55))
    face(d,cx,top+96)
    # arms: left holds churro, right raised
    limb(d,(cx-86,top+170),(cx-150,top+120),16,LIMB)
    ch=[(cx-176,top+150),(cx-120,top+90)]; d.line(ch,fill=(176,110,60),width=26)
    for i in range(5):
        t=i/4; px=cx-176+(cx-120-(cx-176))*t; py=top+150+(top+90-(top+150))*t
        d.line([(px-9,py-9),(px+9,py+9)],fill=(120,72,38),width=3)
    limb(d,(cx+86,top+170),(cx+150,top+118),16,LIMB)
    # legs: right kicks forward to ball
    limb(d,(cx-40,bot),(cx-50,base),18,LIMB); shoe(d,(cx-50,base))
    limb(d,(cx+40,bot),(cx+118,base-26),18,LIMB); shoe(d,(cx+118,base-26))
    ball(d,cx+168,base-20,40)

def coco(d,cx,base):
    top=base-450; bot=base-170
    d.polygon([(cx-92,top),(cx+92,top),(cx+78,bot),(cx-78,bot)],fill=(196,226,231))  # iced cup
    d.polygon([(cx-86,bot-70),(cx+86,bot-70),(cx+78,bot),(cx-78,bot)],fill=(243,236,224))  # coconut layer bottom
    d.ellipse([cx-96,top-20,cx+96,top+30],fill=FOAM)  # cold foam
    # coconut-half crest/head
    d.chord([cx-70,top-90,cx+70,top+50],180,360,fill=(107,74,50))
    d.chord([cx-48,top-60,cx+48,top+40],180,360,fill=(243,236,224))
    d.line([(cx+40,top-58),(cx+120,top-118)],fill=(232,160,122),width=12)  # straw
    face(d,cx,top+88)
    # arms out (relaxed)
    limb(d,(cx-82,top+150),(cx-150,top+170),15,LIMB)
    limb(d,(cx+82,top+150),(cx+152,top+110),15,LIMB)
    # side-volley legs
    limb(d,(cx-30,bot),(cx-44,base),18,LIMB); shoe(d,(cx-44,base))
    limb(d,(cx+34,bot),(cx+140,base-70),18,LIMB); shoe(d,(cx+140,base-70))
    ball(d,cx+186,base-92,38)

def croissant(d,cx,base):
    top=base-440; midy=top+150
    # croissant body: central bump + two horns (crescent)
    d.ellipse([cx-120,midy-95,cx+120,midy+120],fill=(226,176,92))
    for sx in (-1,1):
        d.pieslice([cx+sx*40-150,midy-70,cx+sx*40+150,midy+170],0,360,fill=(226,176,92))
        d.ellipse([cx+sx*150-46,midy-30,cx+sx*150+46,midy+70],fill=(206,148,66))  # horn tip
    # seams
    for i in range(-2,3): d.arc([cx-110,midy-80,cx+110,midy+140],250,290,fill=(196,140,70),width=4)
    # fillings peeking at bottom
    d.polygon([(cx-60,midy+95),(cx-20,midy+150),(cx-90,midy+150)],fill=(127,174,90))  # avocado
    d.polygon([(cx+10,midy+95),(cx+70,midy+150),(cx-10,midy+150)],fill=(243,195,78))  # cheese
    face(d,cx,midy+18)
    # keeper gloves up
    limb(d,(cx-92,midy+40),(cx-150,midy-60),16,LIMB); d.ellipse([cx-172,midy-86,cx-128,midy-42],fill=(238,232,222))
    limb(d,(cx+92,midy+40),(cx+150,midy-60),16,LIMB); d.ellipse([cx+128,midy-86,cx+172,midy-42],fill=(238,232,222))
    # legs planted (keeper stance)
    limb(d,(cx-46,midy+150),(cx-70,base),18,LIMB); shoe(d,(cx-70,base))
    limb(d,(cx+46,midy+150),(cx+70,base),18,LIMB); shoe(d,(cx+70,base))
    ball(d,cx,base-30,34)

# ---- board ----
img=Image.new("RGBA",(W,H),EMBER+(255,))
g=Image.new("L",(W,H),0); gd=ImageDraw.Draw(g); gd.ellipse([CX-700,-300,CX+700,560],fill=110)
g=g.filter(ImageFilter.GaussianBlur(320)); img=Image.composite(Image.new("RGBA",(W,H),(70,39,17,255)),img,g)
d=ImageDraw.Draw(img)
tr_c(d,"COLATTAO  COLLECTION",f("DMMono-Regular.ttf",24),MUTED,CX,70,10)
d.text((CX,116),"Colattaninis",font=f("Gloock-Regular.ttf",84),fill=CREAM,anchor="ma")
tr_c(d,"CHARACTER CONCEPTS · VECTOR DRAFT 1",f("ArsenalSC-Regular.ttf",30),GOLD_HI,CX,236,5)

base=860; cells=[W//6, W//2, 5*W//6]
sh=Image.new("RGBA",(W,H),(0,0,0,0)); shd=ImageDraw.Draw(sh)
for cx in cells: shadow(shd,cx,base)
sh=sh.filter(ImageFilter.GaussianBlur(8)); img.alpha_composite(sh); d=ImageDraw.Draw(img)
for cx in cells: d.line([cx-150,base,cx+150,base],fill=(216,179,109,60),width=2)

latte(d,cells[0],base); coco(d,cells[1],base); croissant(d,cells[2],base)

labels=[("STREET","Churro Latte"),("CLUB","Coco Beach"),("PRO","California Sandwich")]
for cx,(lvl,name) in zip(cells,labels):
    tr_c(d,lvl,f("ArsenalSC-Regular.ttf",30),GOLD_HI,cx,base+44,4)
    d.text((cx,base+86),name,font=f("CrimsonPro-Bold.ttf",40),fill=CREAM,anchor="ma")
tr_c(d,"NON-HUMAN FOOD MASCOTS · NAMES FROM REAL MENU ITEMS · CLAUDE VECTOR DRAFT",f("DMMono-Regular.ttf",18),MUTED,CX,H-46,3)

rgb=img.convert("RGB")
p=OUT+r"\colattanini_characters_draft1.png"
rgb.save(p,"PNG")
print("PNG:",p,"size:",rgb.size)
