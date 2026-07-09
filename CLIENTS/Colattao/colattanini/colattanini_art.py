#!/usr/bin/env python3
# Shared Colattanini mascot art (flat vector) + transparent die-cut sticker renderer.
import math
from PIL import Image, ImageDraw, ImageFilter

CREAM=(255,247,234); LIMB=(58,42,32); EYE=(28,18,12); FOAM=(255,247,234)

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

def latte(d,cx,base):
    top=base-470; bot=base-170
    d.polygon([(cx-98,top),(cx+98,top),(cx+82,bot),(cx-82,bot)],fill=(243,231,211))
    d.rounded_rectangle([cx-92,top+150,cx+92,top+210],radius=12,fill=(150,95,55))
    d.ellipse([cx-105,top-46,cx+105,top+46],fill=FOAM)
    for dx,dy in [(-40,-6),(0,-18),(38,-4),(-12,8),(24,12)]: d.ellipse([cx+dx-7,top+dy-7,cx+dx+7,top+dy+7],fill=(150,95,55))
    face(d,cx,top+96)
    limb(d,(cx-86,top+170),(cx-150,top+120),16,LIMB)
    ch=[(cx-176,top+150),(cx-120,top+90)]; d.line(ch,fill=(176,110,60),width=26)
    for i in range(5):
        t=i/4; px=cx-176+(cx-120-(cx-176))*t; py=top+150+(top+90-(top+150))*t
        d.line([(px-9,py-9),(px+9,py+9)],fill=(120,72,38),width=3)
    limb(d,(cx+86,top+170),(cx+150,top+118),16,LIMB)
    limb(d,(cx-40,bot),(cx-50,base),18,LIMB); shoe(d,(cx-50,base))
    limb(d,(cx+40,bot),(cx+118,base-26),18,LIMB); shoe(d,(cx+118,base-26))
    ball(d,cx+168,base-20,40)

def coco(d,cx,base):
    top=base-450; bot=base-170
    d.polygon([(cx-92,top),(cx+92,top),(cx+78,bot),(cx-78,bot)],fill=(196,226,231))
    d.polygon([(cx-86,bot-70),(cx+86,bot-70),(cx+78,bot),(cx-78,bot)],fill=(243,236,224))
    d.ellipse([cx-96,top-20,cx+96,top+30],fill=FOAM)
    d.chord([cx-70,top-90,cx+70,top+50],180,360,fill=(107,74,50))
    d.chord([cx-48,top-60,cx+48,top+40],180,360,fill=(243,236,224))
    d.line([(cx+40,top-58),(cx+120,top-118)],fill=(232,160,122),width=12)
    face(d,cx,top+88)
    limb(d,(cx-82,top+150),(cx-150,top+170),15,LIMB)
    limb(d,(cx+82,top+150),(cx+152,top+110),15,LIMB)
    limb(d,(cx-30,bot),(cx-44,base),18,LIMB); shoe(d,(cx-44,base))
    limb(d,(cx+34,bot),(cx+140,base-70),18,LIMB); shoe(d,(cx+140,base-70))
    ball(d,cx+186,base-92,38)

def croissant(d,cx,base):
    top=base-440; midy=top+150
    d.ellipse([cx-120,midy-95,cx+120,midy+120],fill=(226,176,92))
    for sx in (-1,1):
        d.pieslice([cx+sx*40-150,midy-70,cx+sx*40+150,midy+170],0,360,fill=(226,176,92))
        d.ellipse([cx+sx*150-46,midy-30,cx+sx*150+46,midy+70],fill=(206,148,66))
    for i in range(-2,3): d.arc([cx-110,midy-80,cx+110,midy+140],250,290,fill=(196,140,70),width=4)
    d.polygon([(cx-60,midy+95),(cx-20,midy+150),(cx-90,midy+150)],fill=(127,174,90))
    d.polygon([(cx+10,midy+95),(cx+70,midy+150),(cx-10,midy+150)],fill=(243,195,78))
    face(d,cx,midy+18)
    limb(d,(cx-92,midy+40),(cx-150,midy-60),16,LIMB); d.ellipse([cx-172,midy-86,cx-128,midy-42],fill=(238,232,222))
    limb(d,(cx+92,midy+40),(cx+150,midy-60),16,LIMB); d.ellipse([cx+128,midy-86,cx+172,midy-42],fill=(238,232,222))
    limb(d,(cx-46,midy+150),(cx-70,base),18,LIMB); shoe(d,(cx-70,base))
    limb(d,(cx+46,midy+150),(cx+70,base),18,LIMB); shoe(d,(cx+70,base))
    ball(d,cx,base-30,34)

MASCOTS={"churro_latte":latte, "coco_beach":coco, "california_sandwich":croissant}

def render_sticker(kind, border=20):
    """Transparent die-cut sticker: cream outline + soft shadow around the mascot. Auto-cropped."""
    W,H=860,1080; cx=W//2; base=H-130
    art=Image.new("RGBA",(W,H),(0,0,0,0)); MASCOTS[kind](ImageDraw.Draw(art),cx,base)
    a=art.getchannel("A")
    dil=a.filter(ImageFilter.GaussianBlur(border)).point(lambda v:255 if v>40 else 0)
    cut=Image.new("RGBA",(W,H),(0,0,0,0))
    # shadow
    sh=Image.new("RGBA",(W,H),(0,0,0,0)); sh.paste((0,0,0,120),(0,16),dil); sh=sh.filter(ImageFilter.GaussianBlur(18))
    cut=Image.alpha_composite(cut,sh)
    # cream border
    bd=Image.new("RGBA",(W,H),(0,0,0,0)); bd.paste(CREAM+(255,),(0,0),dil)
    # thin gold keyline (slightly smaller dilation edge)
    edge=dil.filter(ImageFilter.MaxFilter(3))  # keep crisp
    cut=Image.alpha_composite(cut,bd)
    cut=Image.alpha_composite(cut,art)
    bbox=cut.getbbox()
    if bbox:
        pad=12; bbox=(max(0,bbox[0]-pad),max(0,bbox[1]-pad),min(W,bbox[2]+pad),min(H,bbox[3]+pad))
        cut=cut.crop(bbox)
    return cut

if __name__=="__main__":
    import os
    out=os.path.dirname(os.path.abspath(__file__))
    for k in MASCOTS: render_sticker(k).save(os.path.join(out,f"{k}_sticker.png"))
    print("stickers:", list(MASCOTS))
