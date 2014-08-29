//../wgeCore.js
"use strict";
/*
* wgeCore.js
*
*  Created on: 2014-7-25
*      Author: Wang Yang
*        Blog: http://blog.wysaid.org
*        Mail: admin@wysaid.org
*/

/*
��飺 WGE (Web Graphics Engine) ��һ��webƽ̨�µ�ͼ�����档
       ��Ҫʹ��webglʵ�֣�ͬʱ��дcontext 2d���ݰ汾
	   context 2d�汾��Ҫ���ڼ��ݲ��ֵͰ汾��IE�������������֤֧��WGE�����й���
*/

window.WGE = 
{
	VERSION : '0.0.1'

};

WGE.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);

WGE.clone = function(myObj)
{ 
	if(!myObj)
		return myObj;
	else if(myObj instanceof Array)
		return myObj.slice(0);
	else if(!(myObj instanceof Object))
		return myObj;
	var myNewObj = {}; 
	for(var i in myObj) 
	{
		try
		{
			myNewObj[i] = WGE.clone(myObj[i]);
		} catch(e){}
	}
	return myNewObj; 
};

//���齫�����
WGE.deepClone = function(myObj)
{ 
	if(!myObj)
		return myObj;
	else if(myObj instanceof Array)
	{
		var arr = new Array(myObj.length);
		for(var i = 0; i != myObj.length; ++i)
		{
			try
			{
				arr[i] = WGE.deepClone(myObj[i]);
			}catch(e){}
		}
		return arr;
	}
	else if(!(myObj instanceof Object))
		return myObj;
	var myNewObj = {}; 
	for(var i in myObj) 
	{
		try
		{
			myNewObj[i] = WGE.deepClone(myObj[i]);
		} catch(e){}
	}
	return myNewObj; 
};

WGE.release = function(myObj)
{
	//������ɾ��function��������ԡ�
	if(!(myObj instanceof Object))
		return ;

	for(var i in myObj) 
	{
		try
		{
			delete myObj[i];
		} catch(e){}
	}
};

//deepRelease �᳹��ɾ�����������������Ԫ�أ����������
//��������������ͱ����������ͬһ�����ݣ�Ҳ�ᱻ����ɾ��
//�ڲ�ȷ�����������ò�Ҫʹ�á�
WGE.deepRelease = function(myObj)
{
	if(!(myObj instanceof Object))
		return ;
	else if(myObj instanceof Array)
	{
		for(var i in myObj)
		{
			WGE.release(myObj[i]);
		}
	}

	for(var i in myObj) 
	{
		try
		{
			WGE.release(myObj[i]);
			delete myObj[i];
		} catch(e){}
	}
};

WGE.extend = function(dst, src)
{
	for (var i in src)
	{
		try
		{
			dst[i] = src[i];
		} catch (e) {}
	}
	return dst;
};

//�����÷����� WGE.ClassInitWithArr ��Ϊ��һ���������ݸ�һ�� WGE.Class ����ʱ��
//initialize ��ʹ�õڶ�������(����) ��Ϊ����initialize �Ĳ���������Խ�ǿ��
WGE.ClassInitWithArr = {};

WGE.Class = function()
{
	var wge = function(bInitWithArr, argArray)
	{
    	//initialize Ϊ������ĳ�ʼ��������
    	if(this.initialize && this.initialize.apply)
    	{
    		if(bInitWithArr === WGE.ClassInitWithArr)
    			this.initialize.apply(this, argArray);	
    		else
    			this.initialize.apply(this, arguments);
    	}
    };
    wge.ancestors = WGE.clone(arguments);
    wge.prototype = {};
    for (var i = 0; i < arguments.length; i++)
    {
    	var a = arguments[i]
    	if (a.prototype)
    	{
    		WGE.extend(wge.prototype, a.prototype);
    	}
    	else
    	{
    		WGE.extend(wge.prototype, a);
    	}
    }
    WGE.extend(wge, wge.prototype);
    return wge;
};

WGE.rotateArray = function(arr)
{
	arr.push(arr.shift());
	return arr[arr.length - 1];
};

WGE.getContentByID = function(tagID)
{
	var content = document.getElementById(scriptID);
	if (!content) return "";
	return content.textContent || content.text || content.innerText || content.innerHTML;
};

WGE.getHTMLByID = function(tagID)
{
	var content = document.getElementById(scriptID);
	if (!content) return "";
	return content.innerHTML;
};

WGE.requestTextByURL = function(url, callback)
{
	var async = callback ? true : false;
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open('get', url, async);
	if(async)
	{
		xmlHttp.onreadystatechange = function()	{
			if(xmlHttp.readyState == 4)
			{
				callback(xmlHttp.responseText, xmlHttp);
			}
		};
	}
	xmlHttp.send();
	return xmlHttp.responseText;
};

WGE.CE = function(name)
{
	return document.createElement(name);
};

WGE.ID = function(id)
{
	return document.getElementById(id);
};

//��һ������Ϊ����image url������
//�ڶ�������Ϊ����ͼƬ��ɺ��callback�����ݲ���Ϊһ����������ͼƬ������
//����������Ϊ����ͼƬ��ɺ��callback�����������������ֱ�Ϊ��ǰ��ɵ�ͼƬ�͵�ǰ�Ѿ���ɵ�ͼƬ��
WGE.loadImages = function(imageURLArr, finishCallback, eachCallback)
{
	var n = 0;
	var imgArr = [];

	var F = function() {
		++n;
		if(typeof eachCallback == 'function')
			eachCallback(this, n);
		if(n >= imgArr.length && typeof finishCallback == 'function')
			finishCallback(imgArr);
		this.onload = null; //�����imgArr, n �ȵ�����
	};

	//������ʧ��ʱ��ȷ����������������������Ĭ��404ͼƬ.
	var E = function() {
		this.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAyCAYAAACqNX6+AAAYsUlEQVR4XuWcBZjV1dbG1yQpIhagXhUwUbBbQOAqAo6IiIlKSBhYGICgmHivgagoYReKiSgWiEooJQgGFm03iDD5rd/aZ53Zc5hhBoH7cZ+7fXjOmX/sWO+Kd629j2lF2mQTNrpPS0srMULqtcLCQklPT7dnCgoKJCMjYxPOaPPuOm1TAxIvPz8/XzIzM0sI3sFxIGKwYqA2bzFuvNn9RwCJgYi/s4wYgP91MJDHfwQQF7wNmHBfLnysgGv87W4rvufXNp4Obt49bXJAELgLndiAsPmb77gp/v70009l7ty5ctZZZ5m08vLyJCsra/OW3Caa3SYHxOeN4GMwsIpVq1bJ2WefLV9++aV88MEH8uGHH8qBBx5oYDjXSCUEm0gOm0236wSkNIb0d2buQCBcXNDHH38st9xyizzxxBPmrogrF154odx8881Ss2bN5BAba/y/M+f/r3fKBGRDNTR+3xnUo48+Ktdee60sWrQo6bI+//xzef/9980y9thjDwPofy1uxOCnqbCKXAD4dgTpvt6Dsd93hlSasONO16xZI5UqVbIYwbsImb5zc3Nl2223lT///NPGOeGEE2Ts2LFyww03SP/+/ZMB35/nXae+Hoe45wB7DHIqHbM27tFSwXUXuKGUOpWmx+6YcUuj8akUvzQrNAvh5VgzCaoIr1q1amu5D4TNIvkXJ3AuAL/mffrkPEiPGTNGTj311GQ8ueaaa+T6669P9lWaZaYCGwNV2uJdGLHQY7rtClMRt+R9rVixQrbYYoukgsTgp9J1ZOnM0T8Zs3LlyjYk86L5cyUsRG8WxYGTQFulShXp16+fDB48uMScvfOZM2dK48aNk0J01rTjjjvK8uXLTdi4pkGDBpUIzjw3ffp0Ofzww+WYY46R1157TR588EHp2bOnjYPQXKsRemn015/BKn766Se57rrr5NVXX5Vly5YZO/P3a9euLQcffLA0b95cWrZsKdtss41MmTJFjjzySNluu+0qgkXymb/++stcKmzQ2aErhT8UU3e3Yhc668AT7LLLLuaWs7Ozy6xImMuKZxfnArNnz5ZDDjkkiSoC//rrr83FnHPOOVK/fv2k0P744w/ZcsstbbBx48bJhAkTDFDXUtc0Ajn0lvtvvvmmBfeykkOfl7sDd39cx6oAnYYlX3LJJaaBK1eulN9//12++eYbE4ILkOe23357mThxornTnXfe2d6N3V1pKMWWBfiM6/NFoRAw2s811v7WW2/Jc889Z2vz9uSTTxqYeAPGW5e7LBHUY41EgLiZ3r17y9133219d+jQQW688UYhEOP/3fT4fP3116Vt27b2XKdOnaRr166miXvttZdNGMEwmR49esiIESNsAVjhTTfdZKabGg9SgYyFdeyxx9qCea9Lly7SuXNnwRUyp913312++uorswYEf8UVVyRBmTp1qr3Xt2/f9c5zHBiEznfW8/3338vAgQOlRo0aSU/AepHbZ599ZoqL0uIFuIZyx5ZfmgKkaedFrkUeRzxn4HPWrFly6KGH2rvcxxIefvhho6kx0t26dZNHHnnEJssElyxZIk8//bR07949OS797bDDDubuLrroIqlXr57sueee9k6sOR5HAInrrih8duzYUZ599lkT9tFHH23g8jeC9/n48wsXLjRqPWDAAHNfo0ePNmVq1aqVzSm1jFOagOJrv/76qykZ/TO3pUuXmjfA5cZBffXq1fLGG2/IGWecYRb58ssvJy0rJhmlFVKTQd2DcWkBz2MMz8yZM0eeeeYZcxf87cwM9sSE3bdiokwEQfnCcScExkmTJtlE0S6foI+RmqXHQnv77bctJvgYCAFhDB061DQwZmCxIAEVq7n//vvNIsvT0rKAYf61atUyMFj3t99+a0p38cUXl3C7PufFixfL888/bx6DGEYrLS7G46V5UI8F4ci5abZo0UIQBgvG3A877DDZf//9hZhCQ1PwyVWrVjVKy4Lvvfdem/jpp5+eXATadPLJJ1sAfuyxxwwsb6lMxYUeMxHc0RdffGHzOPPMM836UIojjjgi6TLckvl0i7nsssukXbt29kzTpk3X6cNLA8MFDPOE8DiJIZ965ZVXzD17LEKODjjXcGvErtSUImZhJQCB9pZnqsOHD08yIVwM5jh58mQ57bTTTDhoHVk2QYu4QAO0Bx54QKCL+E6Gwd9jHbgONBrmUl5zoHCBsBT+ZsFYGKCOHDnShI0yPPXUU9ZdqkJxjXsoh7vB+Lny5uD3IQt4AmdzKNYLL7wgF1xwQZLmcg93jMJivTHF9X7WVQ6qUC3rxx9/NN/psQZNue222+Tqq6+2iUBjERLBa++997ZJEPzQIIR/6aWXJq8B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";
	};

	for(var i = 0; i != imageURLArr.length; ++i)
	{
		var img = new Image();
		imgArr.push(img);
		img.src = imageURLArr[i];
		if(img.complete)
		{
			F.call(img);
		}
		else
		{
			img.onload = F;
			img.onerror = E;
		}
	}
}

//��飺 ������Ҫ�ṩ��Animationʹ�õ�sprite 
//       ������ʵ�� wgeSpriteInterface2d �����漰���ķ�����
//       Ϊ�˱�֤������������ʹ�ã�pos�����Ա��������Ч��

WGE.SpriteInterface2d = WGE.Class(
{
	pos : null,           //sprite ����λ��, ����: WGE.Vec2
	scaling : null,       //sprite ����, ����: WGE.Vec2
	rotation : 0,         //sprite ��ת(����)
	alpha : 1,            //sprite ͸����(��Χ0~1)
	zIndex : 0,           //sprite ��zֵ
	childSprites : null,  //sprite ���ӽڵ�

	initialize : function()
	{
		console.warn("This should never be called!");
	},

	getPosition : function()
	{
		return this.pos;
	},

	getScaling : function()
	{
		return this.scaling;
	},

	getRotation : function()
	{
		return this.rotation;
	},

	getAlpha : function()
	{
		return this.alpha;
	},

	getZ : function()
	{
		return this.zIndex;
	},

	//��sprite ����ӽڵ㡣
	addChild : function()
	{
		if(!(this.childSprites instanceof Array))
			this.childSprites = [];
		this.childSprites.push.apply(this.childSprites, arguments);
	},

	//Ҫ�����ӽڵ㣬��ֱ�ӻ�ȡ������js�����������
	getChildren : function()
	{
		return this.childSprites;
	},

	//����sprite������, (0,0)��ʾ���ģ�(-1, -1)��ʾ���Ͻ�(1,1) ��ʾ���½�
	setHotspot : function(hx, hy) {},

	//��sprite��������Ϊ���������ġ�
	setHotspot2Center : function() {},

	//��sprite��������Ϊ���������ʵ�����ص�ĳ����(������������Ͻ�)
	setHotspotWithPixel : function() {},

	//��sprite�ƶ�������ڵ�ǰλ��λ��(dx, dy) ��ĳ��λ�á�
	move : function(dx, dy) {},

	//��sprite�ƶ���ָ��λ�á�
	moveTo : function(x, y) {},

	//��sprite����ڵ�ǰ����ֵ����
	scale : function(sx, sy) {},

	//��sprite�����������С����
	scaleTo : function(sx, sy) {},

	//��sprite����ڵ�ǰ��תֵ��ת (˳ʱ��)
	rotate : function(dRot) {},

	//��sprite��0��ת������ֵ (˳ʱ��)
	rotateTo : function(rot) {},

	//��sprite��Ⱦ��������context֮��
	render : function(ctx) {},

	//���ӽڵ���Ⱦ��������context֮��
	//ע�⣬����ʵ�ַ�ʽ�Ĳ�ͬ��renderChildren�Ĳ���������Լ�sprite����Ҫ��д��
	_renderChildren : function(ctx) {},

});

if(!window.requestAnimationFrame)
{
	// window.requestAnimationFrame = window.mozRequestAnimationFrame ||
	// 						window.webkitRequestAnimationFrame ||
	// 						window.msRequestAnimationFrame ||
	// 						window.oRequestAnimationFrame ||
	// 						function(callback) {
	// 							return setTimeout(callback, 1000 / 60);
	// 						};

	// Ŀǰ���������֧��html5�Ļ�������֧�� requestAnimationFrame
	// ��ʹ�� setTimeoutȷ�����ݣ��Է��� cancel����һһ��Ӧ��
	window.requestAnimationFrame = function(callback) {
		return setTimeout(callback, 1000/60);
	}
}

if(!window.cancelAnimationFrame)
{
	window.cancelAnimationFrame = function(reqID) {
		clearTimeout(reqID);
	}
}



//�⺯��û�����, ��׷��һ��ʹ�����@_@ ���Ӱɡ� ����ʹ��ʱ����ɾ����
WGE.WYSAIDTrackingCode = function()
{
	try
	{
		(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
			(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
			m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
		})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

		ga('create', 'UA-41296769-1', 'wysaid.org');
		ga('send', 'pageview');

		var baidu = WGE.CE('script');
		baidu.setAttribute("type", "text/javascript");
		baidu.src = "http://hm.baidu.com/h.js%3Fb1b964c80dff2a1af1bb8b1ee3e9a7d1";

		var tencent = WGE.CE('script');
		tencent.setAttribute("type", "text/javascript");
		tencent.src = "http://tajs.qq.com/stats?sId=23413950";

		var div = WGE.CE('div');
		div.setAttribute('style', 'display:none');
		
		div.appendChild(baidu);
		div.appendChild(tencent);
		document.body.appendChild(div);
	}catch(e)
	{
		console.log(e);
	};

	delete WGE.WYSAIDTrackingCode;
};

// setTimeout(WGE.WYSAIDTrackingCode, 15000); //��ҳ��15��֮����ͳ�ơ�

//../wgeAlgorithm.js
"use strict";
/*
	Author: wysaid
	Blog: blog.wysaid.org
	Mail: wysaid@gmail.com OR admin@wysaid.org
	Description: ���ļ�����ķ��������漰��Ƶ������, ����ע��ִ��Ч�����⣡
	             Ϊ������Ч��. ���ļ�����������㷨, ���������ݴ����⡣
*/

//���ļ������㷨�ο���: http://opengl.org/

WGE.Vec2 = WGE.Class(
{
	data : null,

	initialize : function(x, y)
	{
		this.data = new Float32Array([x, y]);
	},

	dot : function(v2)
	{
		return this.data[0] * v2.data[0] + this.data[1] * v2.data[1];
	},

	dotSelf : function()
	{
		return this.data[0] * this.data[0] + this.data[1] * this.data[1];
	},

	add : function(v2)
	{
		this.data[0] += v2.data[0];
		this.data[1] += v2.data[1];
		return this;
	},

	sub : function(v2)
	{
		this.data[0] -= v2.data[0];
		this.data[1] -= v2.data[1];
		return this;
	},

	mul : function(v2)
	{
		this.data[0] *= v2.data[0];
		this.data[1] *= v2.data[1];
		return this;
	},

	div : function(v2)
	{
		this.data[0] /= v2.data[0];
		this.data[1] /= v2.data[1];
		return this;
	},

	normalize : function()
	{
		var scale = 1.0 / Math.sqrt(this.data[0]*this.data[0] + this.data[1]*this.data[1]);
		this.data[0] *= scale;
		this.data[1] *= scale;
		return this;
	},

	//////////////////////////////////////////////////

	subFloat : function(fValue)
	{
		this.data[0] -= fValue;
		this.data[1] -= fValue;
	},

	addFloat : function(fValue)
	{
		this.data[0] += fValue;
		this.data[1] += fValue;
	},

	mulFloat : function(fValue)
	{
		this.data[0] *= fValue;
        this.data[1] *= fValue;
	},

	divFloat : function(fValue)
	{
        this.data[0] /= fValue;
        this.data[1] /= fValue;
	}
});

WGE.Vec3 = WGE.Class(
{
	data : null,

	initialize : function(x, y, z)
	{
		this.data = new Float32Array([x, y, z])
	},

	dot : function(v3)
	{
		return this.data[0] * v3.data[0] + this.data[1] * v3.data[1] + this.data[2] * v3.data[2];
	},

	dotSelf : function()
	{
		return this.data[0] * this.data[0] + this.data[1] * this.data[1] + this.data[2] * this.data[2];
	},

	add : function(v3)
	{
		this.data[0] += v3.data[0];
		this.data[1] += v3.data[1];
		this.data[2] += v3.data[2];
		return this;
	},

	sub : function(v3)
	{
		this.data[0] -= v3.data[0];
		this.data[1] -= v3.data[1];
		this.data[2] -= v3.data[2];
		return this;
	},

	mul : function(v3)
	{
		this.data[0] *= v3.data[0];
		this.data[1] *= v3.data[1];
		this.data[2] *= v3.data[2];
		return this;
	},

	div : function(v3)
	{
		this.data[0] /= v3.data[0];
		this.data[1] /= v3.data[1];
		this.data[2] /= v3.data[2];
		return this;
	},

	normalize : function()
	{
		var scale = 1.0 / Math.sqrt(this.data[0]*this.data[0] + this.data[1]*this.data[1] + this.data[2]*this.data[2]);
		this.data[0] *= scale;
		this.data[1] *= scale;
		this.data[2] *= scale;
		return this;
	},

	//////////////////////////////////////////////////

	subFloat : function(fValue)
	{
		this.data[0] -= fValue;
		this.data[1] -= fValue;
		this.data[2] -= fValue;
	},

	addFloat : function(fValue)
	{
		this.data[0] += fValue;
		this.data[1] += fValue;
		this.data[2] += fValue;
	},

	mulFloat : function(fValue)
	{
		this.data[0] *= fValue;
        this.data[1] *= fValue;
        this.data[2] *= fValue;
	},

	divFloat : function(fValue)
	{
        this.data[0] /= fValue;
        this.data[1] /= fValue;
        this.data[2] /= fValue;
	},

	//////////////////////////////////////////////////

	cross : function(v3)
	{
		var x = this.data[1] * v3.data[2] - this.data[2] * v3.data[1];
        var y = this.data[2] * v3.data[0] - this.data[0] * v3.data[2];
        this.data[2] = this.data[0] * v3.data[1] - this.data[1] * v3.data[0];
        this.data[0] = x;
        this.data[1] = y;
	}		
});

WGE.makeVec3 = function(x, y, z)
{
	return new WGE.Vec3(x, y, z);
};

WGE.vec3Sub = function(v3Left, v3Right)
{
	return WGE.makeVec3(v3Left.data[0] - v3Right.data[0],
		v3Left.data[1] - v3Right.data[1],
		v3Left.data[2] - v3Right.data[2]);
};

WGE.vec3Add = function(v3Left, v3Right)
{
	return WGE.makeVec3(v3Left.data[0] + v3Right.data[0],
		v3Left.data[1] + v3Right.data[1],
		v3Left.data[2] + v3Right.data[2]);
};

WGE.vec3Mul = function(v3Left, v3Right)
{
	return WGE.makeVec3(v3Left.data[0] * v3Right.data[0],
		v3Left.data[1] * v3Right.data[1],
		v3Left.data[2] * v3Right.data[2]);
};

WGE.vec3Div = function(v3Left, v3Right)
{
	return WGE.makeVec3(v3Left.data[0] / v3Right.data[0],
		v3Left.data[1] / v3Right.data[1],
		v3Left.data[2] / v3Right.data[2]);
};

//////////////////////////////////////////////////

WGE.vec3SubFloat = function(v3Left, fValue)
{
	return WGE.makeVec3(v3Left.data[0] - fValue,
		v3Left.data[1] - fValue,
		v3Left.data[2] - fValue);
};

WGE.vec3AddFloat = function(v3Left, fValue)
{
	return WGE.makeVec3(v3Left.data[0] + fValue,
		v3Left.data[1] + fValue,
		v3Left.data[2] + fValue);
};

WGE.vec3MulFloat = function(v3Left, fValue)
{
	return WGE.makeVec3(v3Left.data[0] * fValue,
		v3Left.data[1] * fValue,
		v3Left.data[2] * fValue);
};

WGE.vec3DivFloat = function(v3Left, fValue)
{
	return WGE.makeVec3(v3Left.data[0] / fValue,
		v3Left.data[1] / fValue,
		v3Left.data[2] / fValue);
};

//////////////////////////////////////////////////

WGE.vec3Cross = function(v3Left, v3Right)
{
	return WGE.makeVec3(v3Left.data[1] * v3Right.data[2] - v3Left.data[2] * v3Right.data[1],
			v3Left.data[2] * v3Right.data[0] - v3Left.data[0] * v3Right.data[2],
			v3Left.data[0] * v3Right.data[1] - v3Left.data[1] * v3Right.data[0]);
};



WGE.vec3Project = function(v3ToProj, projVec)
{
	var d = projVec.dot(v3ToProj) / projVec.dotSelf();
	return WGE.vec3MulFloat(projVec, d);
};

//////////////////////////////////////////////////////


// vector 4 û��ô�õ�����ʱ��д̫�ࡣ
WGE.Vec4 = WGE.Class(
{
	data : null,

	initialize : function(x, y, z, w)
	{
		this.data = new Float32Array([x, y, z, w]);
	}
});




//////////////////////////////////////////////////////
//
//        Hard code for matrix.   --By wysaid
//
//////////////////////////////////////////////////////

WGE.Mat2 = WGE.Class(
{
	data : null,

	initialize : function(m00, m01, m10, m11)
	{
		this.data = new Float32Array([m00, m01, m10, m11]);
	},

	rotate : function(rad)
	{
		this.data = WGE.mat2Mul(this, WGE.mat2Rotation(rad)).data;
	}

});

WGE.makeMat2 = function (m00, m01, m10, m11)
{
    return new WGE.Mat2(m00, m01, m10, m11);
};

WGE.mat2Identity = function ()
{
    return new WGE.Mat2(1.0, 0.0, 0.0, 1.0);
};

WGE.mat2Scale = function (x, y, z)
{
    return new WGE.Mat2(x, 0.0, 0.0, y);
};

WGE.mat2Rotation = function (rad)
{
    var cosRad = Math.cos(rad);
    var sinRad = Math.sin(rad);
    return new WGE.Mat2(cosRad, sinRad, -sinRad, cosRad);
};

WGE.mat2Mul = function (mat2Left, mat2Right)
{
    return new WGE.Mat2(mat2Left.data[0] * mat2Right.data[0] + mat2Left.data[2] * mat2Right.data[1],
		mat2Left.data[1] * mat2Right.data[0] + mat2Left.data[3] * mat2Right.data[1],
		mat2Left.data[0] * mat2Right.data[2] + mat2Left.data[2] * mat2Right.data[3],
		mat2Left.data[1] * mat2Right.data[2] + mat2Left.data[3] * mat2Right.data[3]);
};

WGE.mat2MulVec2 = function(mat2Left, vec2Right)
{
	return new WGE.Vec2(mat2Left.data[0] * vec2Right.data[0] + mat2Left.data[2] * vec2Right.data[1],
		mat2Left.data[1] * vec2Right.data[0] + mat2Left.data[3] * vec2Right.data[1]);
}

//////////////////////////////////////////////////////
// matrix 3 x 3
//////////////////////////////////////////////////////

WGE.Mat3 = WGE.Class(
{
    data: null,

    initialize: function (m00, m01, m02, m10, m11, m12, m20, m21, m22)
    {
        this.data = new Float32Array([m00, m01, m02, m10, m11, m12, m20, m21, m22]);
    },

    transpose: function ()
    {
        this.data = new Float32Array([this.data[0], this.data[3], this.data[6],
			this.data[1], this.data[4], this.data[7],
			this.data[2], this.data[5], this.data[8]]);
    },

    rotate : function(rad, x, y, z)
    {
    	this.data = WGE.mat3Mul(this, WGE.mat3Rotation(rad, x, y, z)).data;
    },
    
    rotateX : function(rad)
    {
    	this.data = WGE.mat3Mul(this, WGE.mat3XRotation(rad)).data;
    },

    rotateY : function(rad)
    {
    	this.data = WGE.mat3Mul(this, WGE.mat3YRotation(rad)).data;
    },

    rotateZ : function(rad)
    {
    	this.data = WGE.mat3Mul(this, WGE.mat3ZRotation(rad)).data;
    }

});

WGE.mat3Mul = function (mat3Left, mat3Right)
{
    return new WGE.Mat3(mat3Left.data[0] * mat3Right.data[0] + mat3Left.data[3] * mat3Right.data[1] + mat3Left.data[6] * mat3Right.data[2],
		mat3Left.data[1] * mat3Right.data[0] + mat3Left.data[4] * mat3Right.data[1] + mat3Left.data[7] * mat3Right.data[2],
		mat3Left.data[2] * mat3Right.data[0] + mat3Left.data[5] * mat3Right.data[1] + mat3Left.data[8] * mat3Right.data[2],

		mat3Left.data[0] * mat3Right.data[3] + mat3Left.data[3] * mat3Right.data[4] + mat3Left.data[6] * mat3Right.data[5],
		mat3Left.data[1] * mat3Right.data[3] + mat3Left.data[4] * mat3Right.data[4] + mat3Left.data[7] * mat3Right.data[5],
		mat3Left.data[2] * mat3Right.data[3] + mat3Left.data[5] * mat3Right.data[4] + mat3Left.data[8] * mat3Right.data[5],

		mat3Left.data[0] * mat3Right.data[6] + mat3Left.data[3] * mat3Right.data[7] + mat3Left.data[6] * mat3Right.data[8],
		mat3Left.data[1] * mat3Right.data[6] + mat3Left.data[4] * mat3Right.data[7] + mat3Left.data[7] * mat3Right.data[8],
		mat3Left.data[2] * mat3Right.data[6] + mat3Left.data[5] * mat3Right.data[7] + mat3Left.data[8] * mat3Right.data[8]);
};

WGE.mat3MulVec3 = function (mat3, vec3)
{
    return new WGE.Mat3(mat3.data[0] * vec3.data[0] + mat3.data[3] * vec3.data[1] + mat3.data[6] * vec3.data[2],
		mat3.data[1] * vec3.data[0] + mat3.data[4] * vec3.data[1] + mat3.data[7] * vec3.data[2],
		mat3.data[2] * vec3.data[0] + mat3.data[5] * vec3.data[1] + mat3.data[8] * vec3.data[2]);
};

/////////////////////////////////////////////////////////////

WGE.makeMat3 = function (m00, m01, m02, m10, m11, m12, m20, m21, m22)
{
    return new WGE.Mat3(m00, m01, m02, m10, m11, m12, m20, m21, m22);
};

WGE.mat3Identity = function ()
{
    return new WGE.Mat3(1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0);
};

WGE.mat3Scale = function (x, y, z)
{
    return new WGE.Mat3(x, 0.0, 0.0, 0.0, y, 0.0, 0.0, 0.0, z);
};

WGE.mat3Rotation = function (rad, x, y, z)
{
    var scale = 1.0 / Math.sqrt(x * x + y * y + z * z);
    x *= scale;
    y *= scale;
    z *= scale;
    var cosRad = Math.cos(rad);
    var cosp = 1.0 - cosRad;
    var sinRad = Math.sin(rad);
    return new WGE.Mat3(cosRad + cosp * x * x,
		cosp * x * y + z * sinRad,
		cosp * x * z - y * sinRad,
		cosp * x * y - z * sinRad,
		cosRad + cosp * y * y,
		cosp * y * z + x * sinRad,
		cosp * x * z + y * sinRad,
		cosp * y * z - x * sinRad,
		cosRad + cosp * z * z);
};

WGE.mat3XRotation = function (rad)
{
    var cosRad = Math.cos(rad);
    var sinRad = Math.sin(rad);
    return new WGE.Mat3(1.0, 0.0, 0.0,
		0.0, cosRad, sinRad,
		0.0, -sinRad, cosRad);
};

WGE.mat3YRotation = function (rad)
{
    var cosRad = Math.cos(rad);
    var sinRad = Math.sin(rad);
    return new WGE.Mat3(cosRad, 0.0, -sinRad,
		0.0, 1.0, 0.0,
		sinRad, 0.0, cosRad);
};

WGE.mat3ZRotation = function (rad)
{
    var cosRad = Math.cos(rad);
    var sinRad = Math.sin(rad);
    return new WGE.Mat3(cosRad, sinRad, 0.0,
		-sinRad, cosRad, 0.0,
		0.0, 0.0, 1.0);
};

WGE.mat3Mul = function (mat3Left, mat3Right)
{
    return new WGE.Mat3(mat3Left.data[0] * mat3Right.data[0] + mat3Left.data[3] * mat3Right.data[1] + mat3Left.data[6] * mat3Right.data[2],
		mat3Left.data[1] * mat3Right.data[0] + mat3Left.data[4] * mat3Right.data[1] + mat3Left.data[7] * mat3Right.data[2],
		mat3Left.data[2] * mat3Right.data[0] + mat3Left.data[5] * mat3Right.data[1] + mat3Left.data[8] * mat3Right.data[2],

		mat3Left.data[0] * mat3Right.data[3] + mat3Left.data[3] * mat3Right.data[4] + mat3Left.data[6] * mat3Right.data[5],
		mat3Left.data[1] * mat3Right.data[3] + mat3Left.data[4] * mat3Right.data[4] + mat3Left.data[7] * mat3Right.data[5],
		mat3Left.data[2] * mat3Right.data[3] + mat3Left.data[5] * mat3Right.data[4] + mat3Left.data[8] * mat3Right.data[5],

		mat3Left.data[0] * mat3Right.data[6] + mat3Left.data[3] * mat3Right.data[7] + mat3Left.data[6] * mat3Right.data[8],
		mat3Left.data[1] * mat3Right.data[6] + mat3Left.data[4] * mat3Right.data[7] + mat3Left.data[7] * mat3Right.data[8],
		mat3Left.data[2] * mat3Right.data[6] + mat3Left.data[5] * mat3Right.data[7] + mat3Left.data[8] * mat3Right.data[8]);
};

WGE.mat3MulVec3 = function (mat3, vec3)
{
    return new WGE.Mat3(mat3.data[0] * vec3.data[0] + mat3.data[3] * vec3.data[1] + mat3.data[6] * vec3.data[2],
		mat3.data[1] * vec3.data[0] + mat3.data[4] * vec3.data[1] + mat3.data[7] * vec3.data[2],
		mat3.data[2] * vec3.data[0] + mat3.data[5] * vec3.data[1] + mat3.data[8] * vec3.data[2]);
};


////////////////////////////////////////////////////////////////////
// matrix 4 x 4
////////////////////////////////////////////////////////////////////

WGE.Mat4 = WGE.Class(
{
	data : null,

	initialize : function(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33)
	{
		this.data = new Float32Array([m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33]);
	},

	transpose : function()
	{
		this.data = new Float32Array([this.data[0],  this.data[4],  this.data[8],  this.data[12],
			this.data[1],  this.data[5],  this.data[9],  this.data[13],
			this.data[2],  this.data[6],  this.data[10],  this.data[14],
			this.data[3],  this.data[7],  this.data[11],  this.data[15]]);
	},

	translateX : function(x)
	{
		this.data[12] += this.data[0] * x;
		this.data[13] += this.data[1] * x;
		this.data[14] += this.data[2] * x;
	},

	translateY : function(y)
	{
		this.data[12] += this.data[4] * y;
		this.data[13] += this.data[5] * y;
		this.data[14] += this.data[6] * y;
	},

	translateZ : function(z)
	{
		this.data[12] += this.data[8] * z;
		this.data[13] += this.data[9] * z;
		this.data[14] += this.data[10] * z;
	},

	scaleX : function(x)
	{
		this.data[0] *= x;
		this.data[1] *= x;
		this.data[2] *= x;
		this.data[3] *= x;
	},

	scaleY : function(y)
	{
		this.data[4] *= y;
		this.data[5] *= y;
		this.data[6] *= y;
		this.data[7] *= y;
	},

	scaleZ : function(z)
	{
		this.data[8] *= z;
		this.data[9] *= z;
		this.data[10] *= z;
		this.data[11] *= z;
	},

	scale : function(x, y, z)
	{
		this.scaleX(x);
		this.scaleY(y);
		this.scaleZ(z);
	},

	rotate : function(rad, x, y, z)
    {
    	this.data = WGE.mat4Mul(this, WGE.mat4Rotation(rad, x, y, z)).data;
    },
    
    rotateX : function(rad)
    {
    	this.data = WGE.mat4Mul(this, WGE.mat4XRotation(rad)).data;
    },

    rotateY : function(rad)
    {
    	this.data = WGE.mat4Mul(this, WGE.mat4YRotation(rad)).data;
    },

    rotateZ : function(rad)
    {
    	this.data = WGE.mat4Mul(this, WGE.mat4ZRotation(rad)).data;
    }
});

/////////////////////////////////////////////////////////////

WGE.makeMat4 = function(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33)
{
	return new WGE.Mat4(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33);
};

WGE.mat4Identity = function()
{
	return new WGE.Mat4(1.0, 0.0, 0.0, 0.0,
					0.0, 1.0, 0.0, 0.0,
					0.0, 0.0, 1.0, 0.0,
					0.0, 0.0, 0.0, 1.0);
};

WGE.mat4Translation = function(x, y, z)
{
	return new WGE.Mat4(1.0, 0.0, 0.0, 0.0,
		0.0, 1.0, 0.0, 0.0,
		0.0, 0.0, 1.0, 0.0,
		x, y, z, 1.0);
};

WGE.mat4Scale = function(x, y, z)
{
	return new WGE.Mat4(x, 0.0, 0.0, 0.0,
		0.0, y, 0.0, 0.0,
		0.0, 0.0, z, 0.0,
		0.0, 0.0, 0.0, 1.0);
};

WGE.mat4Rotation = function(rad, x, y, z)
{
	var scale = 1.0 / Math.sqrt(x*x + y*y + z*z);
	x *= scale;
	y *= scale;
	z *= scale;
	var cosRad = Math.cos(rad);
	var cosp = 1.0 - cosRad;
	var sinRad = Math.sin(rad);
	return new WGE.Mat4(cosRad + cosp * x * x,
		cosp * x * y + z * sinRad,
		cosp * x * z - y * sinRad,
		0.0,
		cosp * x * y - z * sinRad,
		cosRad + cosp * y * y,
		cosp * y * z + x * sinRad,
		0.0,
		cosp * x * z + y * sinRad,
		cosp * y * z - x * sinRad,
		cosRad + cosp * z * z,
		0.0, 0.0, 0.0, 0.0, 1.0);
};

WGE.mat4XRotation = function(rad)
{
	var cosRad = Math.cos(rad);
	var sinRad = Math.sin(rad);
	return new WGE.Mat4(1.0, 0.0, 0.0, 0.0,
		0.0, cosRad, sinRad, 0.0,
		0.0, -sinRad, cosRad, 0.0,
		0.0, 0.0, 0.0, 1.0);
};

WGE.mat4YRotation = function(rad)
{
	var cosRad = Math.cos(rad);
	var sinRad = Math.sin(rad);
	return new WGE.Mat4(cosRad, 0.0, -sinRad, 0.0,
		0.0, 1.0, 0.0, 0.0,
		sinRad, 0.0, cosRad, 0.0,
		0.0, 0.0, 0.0, 1.0);
};

WGE.mat4ZRotation = function(rad)
{
	var cosRad = Math.cos(rad);
	var sinRad = Math.sin(rad);
	return new WGE.Mat4(cosRad, sinRad, 0.0, 0.0,
		-sinRad, cosRad, 0.0, 0.0,
		0.0, 0.0, 1.0, 0.0,
		0.0, 0.0, 0.0, 1.0);
};

WGE.makePerspective = function(fovyRad, aspect, nearZ, farZ)
{
	var cotan = 1.0 / Math.tan(fovyRad / 2.0);
	return new WGE.Mat4(cotan / aspect, 0.0, 0.0, 0.0,
		0.0, cotan, 0.0, 0.0,
		0.0, 0.0, (farZ + nearZ) / (nearZ - farZ), -1.0,
		0.0, 0.0, (2.0 * farZ * nearZ) / (nearZ - farZ), 0.0);
};

WGE.makeFrustum = function(left, right, bottom, top, nearZ, farZ)
{
	var ral = right + left;
	var rsl = right - left;
	var tsb = top - bottom;
	var tab = top + bottom;
	var fan = farZ + nearZ;
	var fsn = farZ - nearZ;

	return new WGE.Mat4(2.0 * nearZ / rsl, 0.0, 0.0, 0.0,
		0.0, 2.0 * nearZ / tsb, 0.0, 0.0,
		ral / rsl, tab / tsb, -fan / fsn, -1.0,
		0.0, 0.0, (-2.0 * farZ * nearZ) / fsn, 0.0);
};

WGE.makeOrtho = function(left, right, bottom, top, nearZ, farZ)
{
	var ral = right + left;
	var rsl = right - left;
	var tsb = top - bottom;
	var tab = top + bottom;
	var fan = farZ + nearZ;
	var fsn = farZ - nearZ;

	return new WGE.Mat4(2.0 / rsl, 0.0, 0.0, 0.0,
		0.0, 2.0 / tsb, 0.0, 0.0,
		0.0, 0.0, -2.0 / fsn, 0.0,
		-ral / rsl, -tab / tsb, -fan / fsn, 1.0);
};

WGE.makeLookAt = function(eyeX, eyeY, eyeZ, centerX, centerY, centerZ,	upX, upY, upZ)
{
    var ev = WGE.makeVec3(eyeX, eyeY, eyeZ);
    var cv = WGE.makeVec3(centerX, centerY, centerZ);
    var uv = WGE.makeVec3(upX, upY, upZ);
    var n = WGE.vec3Sub(ev, cv).normalize();
    var u = WGE.vec3Cross(uv, n).normalize();
    var v = WGE.vec3Cross(n, u);

	return new WGE.Mat4(u.data[0], v.data[0], n.data[0], 0.0,
		u.data[1], v.data[1], n.data[1], 0.0,
		u.data[2], v.data[2], n.data[2], 0.0,
		-u.dot(ev),
		-v.dot(ev),
		-n.dot(ev),
		1.0);
};

WGE.mat4Mul = function(mat4Left, mat4Right)
{
	return new WGE.Mat4(mat4Left.data[0] * mat4Right.data[0] + mat4Left.data[4] * mat4Right.data[1] + mat4Left.data[8] * mat4Right.data[2] + mat4Left.data[12] * mat4Right.data[3],
		mat4Left.data[1] * mat4Right.data[0] + mat4Left.data[5] * mat4Right.data[1] + mat4Left.data[9] * mat4Right.data[2] + mat4Left.data[13] * mat4Right.data[3],
		mat4Left.data[2] * mat4Right.data[0] + mat4Left.data[6] * mat4Right.data[1] + mat4Left.data[10] * mat4Right.data[2] + mat4Left.data[14] * mat4Right.data[3],
		mat4Left.data[3] * mat4Right.data[0] + mat4Left.data[7] * mat4Right.data[1] + mat4Left.data[11] * mat4Right.data[2] + mat4Left.data[15] * mat4Right.data[3],
		mat4Left.data[0] * mat4Right.data[4] + mat4Left.data[4] * mat4Right.data[5] + mat4Left.data[8] * mat4Right.data[6] + mat4Left.data[12] * mat4Right.data[7],
		mat4Left.data[1] * mat4Right.data[4] + mat4Left.data[5] * mat4Right.data[5] + mat4Left.data[9] * mat4Right.data[6] + mat4Left.data[13] * mat4Right.data[7],
		mat4Left.data[2] * mat4Right.data[4] + mat4Left.data[6] * mat4Right.data[5] + mat4Left.data[10] * mat4Right.data[6] + mat4Left.data[14] * mat4Right.data[7],
		mat4Left.data[3] * mat4Right.data[4] + mat4Left.data[7] * mat4Right.data[5] + mat4Left.data[11] * mat4Right.data[6] + mat4Left.data[15] * mat4Right.data[7],
		mat4Left.data[0] * mat4Right.data[8] + mat4Left.data[4] * mat4Right.data[9] + mat4Left.data[8] * mat4Right.data[10] + mat4Left.data[12] * mat4Right.data[11],
		mat4Left.data[1] * mat4Right.data[8] + mat4Left.data[5] * mat4Right.data[9] + mat4Left.data[9] * mat4Right.data[10] + mat4Left.data[13] * mat4Right.data[11],
		mat4Left.data[2] * mat4Right.data[8] + mat4Left.data[6] * mat4Right.data[9] + mat4Left.data[10] * mat4Right.data[10] + mat4Left.data[14] * mat4Right.data[11],
		mat4Left.data[3] * mat4Right.data[8] + mat4Left.data[7] * mat4Right.data[9] + mat4Left.data[11] * mat4Right.data[10] + mat4Left.data[15] * mat4Right.data[11],
		mat4Left.data[0] * mat4Right.data[12] + mat4Left.data[4] * mat4Right.data[13] + mat4Left.data[8] * mat4Right.data[14] + mat4Left.data[12] * mat4Right.data[15],			
		mat4Left.data[1] * mat4Right.data[12] + mat4Left.data[5] * mat4Right.data[13] + mat4Left.data[9] * mat4Right.data[14] + mat4Left.data[13] * mat4Right.data[15],			
		mat4Left.data[2] * mat4Right.data[12] + mat4Left.data[6] * mat4Right.data[13] + mat4Left.data[10] * mat4Right.data[14] + mat4Left.data[14] * mat4Right.data[15],			
		mat4Left.data[3] * mat4Right.data[12] + mat4Left.data[7] * mat4Right.data[13] + mat4Left.data[11] * mat4Right.data[14] + mat4Left.data[15] * mat4Right.data[15]);
};

WGE.mat4MulVec4 = function(mat4, vec4)
{
	return new WGE.Mat4(mat4.data[0] * vec4.data[0] + mat4.data[4] * vec4.data[1] + mat4.data[8] * vec4.data[2] + mat4.data[12] * vec4.data[3],
		mat4.data[1] * vec4.data[0] + mat4.data[5] * vec4.data[1] + mat4.data[9] * vec4.data[2] + mat4.data[13] * vec4.data[3],
		mat4.data[2] * vec4.data[0] + mat4.data[6] * vec4.data[1] + mat4.data[10] * vec4.data[2] + mat4.data[14] * vec4.data[3],
		mat4.data[3] * vec4.data[0] + mat4.data[7] * vec4.data[1] + mat4.data[11] * vec4.data[2] + mat4.data[15] * vec4.data[3]);
};

WGE.mat4MulVec3 = function(mat4, vec3)
{
	return new WGE.Mat4(mat4.data[0] * vec3.data[0] + mat4.data[4] * vec3.data[1] + mat4.data[8] * vec3.data[2],
		mat4.data[1] * vec3.data[0] + mat4.data[5] * vec3.data[1] + mat4.data[9] * vec3.data[2],
		mat4.data[2] * vec3.data[0] + mat4.data[6] * vec3.data[1] + mat4.data[10] * vec3.data[2]);
};

//ͨ����Ԫ����������
WGE.mat4WithQuaternion = function(x, y, z, w)
{
	var scale = 1.0 / Math.sqrt(x*x + y*y + z*z + w*w);
	x *= scale;
	y *= scale;
	z *= scale;
	w *= scale;
	var _2x = x + x;
	var _2y = y + y;
	var _2z = z + z;
	var _2w = w + w;
	return new WGE.Mat4(1.0 - _2y * y - _2z * z,
		_2x * y + _2w * z,
		_2x * z - _2w * y,
		0.0,
		_2x * y - _2w * z,
		1.0 - _2x * x - _2z * z,
		_2y * z + _2w * x,
		0.0,
		_2x * z + _2w * y,
		_2y * z - _2w * x,
		1.0 - _2x * x - _2y * y,
		0.0, 0.0, 0.0, 0.0, 1.0);
};

//obj: WGEVec4; w should be 1.0
//modelViewMat, projMat: WGE.Mat4;
//viewport: WGE.Vec4;
//winCoord: WGE.Vec3;
WGE.projectMat4 = function(obj, modelViewMat, projMat, viewport, winCoord)
{
    var result = WGE.mat4MulVec4(projMat, WGE.mat4MulVec4(modelViewMat, obj));

	if (result.data[3] == 0.0)
		return false;

	result.data[0] /= result.data[3];
	result.data[1] /= result.data[3];
	result.data[2] /= result.data[3];

	winCoord.data[0] = viewport.data[0] + (1.0 + result.data[0]) * viewport.data[2] / 2.0;
	winCoord.data[1] = viewport.data[1] + (1.0 + result.data[1]) * viewport.data[3] / 2.0;
	if(winCoord.data[2])
		winCoord.data[2] = (1.0 + result.data[2]) / 2.0;
	return true;
};


///////////////////////////////////////////////////
//
//    ������һЩ����������޹ص���ѧ����
//    ÿһ������������д�������÷�����������
//
///////////////////////////////////////////////////


/////////////////////////////////////

//lineIntersectionV �� lineIntersectionA ��Ϊ������ֱ�߽���ĺ���
//P0, p1 Ϊ��һ��ֱ���ϵ�������, p2, p3 Ϊ�ڶ���ֱ���ϵ������㡣

WGE.lineIntersectionV = function(p0, p1, p2, p3)
{
	var D = (p0.data[1] - p1.data[1]) * (p3.data[0] - p2.data[0]) + (p0.data[0] - p1.data[0]) * (p2.data[1] - p3.data[1]);
    var Dx = (p1.data[0] * p0.data[1] - p0.data[0] * p1.data[1]) * (p3.data[0] - p2.data[0]) + (p0.data[0] - p1.data[0]) * (p3.data[0] * p2.data[1] - p2.data[0] * p3.data[1]);
    var Dy = (p0.data[1] - p1.data[1]) * (p3.data[0] * p2.data[1] - p2.data[0] * p3.data[1]) + (p3.data[1] - p2.data[1]) * (p1.data[0] * p0.data[1] - p0.data[0] * p1.data[1]);
    return new WGE.Vec2(Dx / D, Dy / D);
};

WGE.lineIntersectionA = function(p0, p1, p2, p3)
{
	var D = (p0[1] - p1[1]) * (p3[0] - p2[0]) + (p0[0] - p1[0]) * (p2[1] - p3[1]);
    var Dx = (p1[0] * p0[1] - p0[0] * p1[1]) * (p3[0] - p2[0]) + (p0[0] - p1[0]) * (p3[0] * p2[1] - p2[0] * p3[1]);
    var Dy = (p0[1] - p1[1]) * (p3[0] * p2[1] - p2[0] * p3[1]) + (p3[1] - p2[1]) * (p1[0] * p0[1] - p0[0] * p1[1]);
    return [Dx / D, Dy / D];
};

//////////////////////////////////////

//../wgeAnimation.js
"use strict";
/*
* wgeAnimation.js
*
*  Created on: 2014-7-25
*      Author: Wang Yang
*        Blog: http://blog.wysaid.org
*/


// TimeActionInterface ������Time line���ܻ��õ��Ĺ���������
// ��Щ�����������������Ҫ�õ��Ļ������ʵ������
// TimeActionInterface �����㶯���Ƿ�ʼ���߽���
WGE.TimeActionInterface = WGE.Class(
{
	// Ϊ�˷���ͳһ���㣬 percent ֵ��Χ����Ϊ[0, 1]�� �ڲ�����ʱ������ת����
	act : function(percent) {},

	// ΪAction��ʼ��׼�������������һЩ���Խ��и�λ��(�Ǳ���)
	actionStart : function() {},

	// Action����֮���ɨβ���������罫ĳ���������˶�����֮���״̬��
	actionStop : function() {},

	bind : function(obj) { this.bindObj = obj; }, // �������󶨵�ĳ��ʵ�ʵĶ���

	// ��һ��TimeAttrib���ظ��Ĵ���, ��ĳЩ�����Ƚ����ã�����ת
	repeatTimes : 1,
	bindObj : undefined,

	// ע�⣺�����ʱ���������ĳ�� SpriteAnimation�����ʱ�䣬����������ʱ�����ʱ�䣡
	tStart : 0, //��ʼʱ��
	tEnd : 0 //����ʱ��
});

WGE.AnimationInterface2d = WGE.Class(
{
	startTime : undefined,
	endTime : undefined,
	timeActions : undefined, //action���飬���ڹ涨ʱ�������ָ���Ķ���
	actions2Run : undefined, //ʱ����������δ��ɵ�action��

	initialize : function(startTime, endTime)
	{
		this.setAttrib(startTime, endTime);
		this.timeActions = [];
	},

	setAttrib : function(tStart, tEnd)
	{
		this.startTime = parseFloat(tStart);
		this.endTime = parseFloat(tEnd);
	},

	push : function(action)
	{
		if(action.bind)
			action.bind(this);
		this.timeActions.push(action);
	},

	pushArr : function(actions)
	{
		for(var i in actions)
		{
			if(actions[i].bind)
				actions[i].bind(this);
			this.timeActions.push(actions[i]);
		}
	},

	clear : function()
	{
		this.timeActions = [];
	},

	run : function(totalTime)
	{
		var time = totalTime - this.startTime;
		var running = false;

		var len = this.actions2Run.length;
		var hasDelete = false;

		for(var i = 0; i != len; ++i)
		{
			var action = this.actions2Run[i];
			if(!action) continue;

			if(time >= action.tEnd)
			{
				action.actionStop();
				delete this.actions2Run[i];
				hasDelete = true;
			}
			else if(time > action.tStart)
			{
				var t = (time - action.tStart) / (action.tEnd - action.tStart);
				action.act(t);
			}

			running = true;
		}

		if(hasDelete)
		{
			var newArr = [];
			var arr = this.actions2Run;
			for(var i = 0; i != len; ++i)
			{
				if(arr[i])
					newArr.push(arr[i]);
			}
			this.actions2Run = newArr;
		}

		return running;
	},

	//������ת
	runTo : function(time)
	{

	},

	//����ʱ��action��λ��
	timeStart : function()
	{
		for(var i = 0; i != this.timeActions.length; ++i)
		{
			this.timeActions[i].actionStart();
		}
		this.actions2Run = WGE.clone(this.timeActions);
	},

	//����ʱ��action����Ϊ����״̬
	timeUp : function()
	{
		for(var i = 0; i != this.actions2Run.length; ++i)
		{
			this.actions2Run[i].actionStop();
		}
		this.actions2Run = undefined;
	}
});

WGE.AnimationWithChildrenInterface2d = WGE.Class(WGE.AnimationInterface2d,
{
	childSprites : null, //js�����÷�����չ�˶�action�ĸ��¡�

	run : function(totalTime)
	{
		WGE.AnimationInterface2d.run.call(this, totalTime);

		for(var i in this.childSprites)
		{
			this.childSprites[i].run(totalTime);
		}
	},

	//������ת
	runTo : function(time)
	{
		WGE.AnimationInterface2d.runTo.call(this, time);
		for(var i in childSprites)
		{
			this.childSprites[i].runTo(time);
		}
	},

	//����ʱ��action��λ��
	timeStart : function()
	{
		WGE.AnimationInterface2d.timeStart.call(this);
		for(var i in this.childSprites)
		{
			this.childSprites[i].timeStart();
		}
	},

	//����ʱ��action����Ϊ����״̬
	timeUp : function()
	{
		WGE.AnimationInterface2d.timeUp.call(this);
		for(var i in this.childSprites)
		{
			this.childSprites[i].timeUp();
		}
	}

});


//�����÷�, ������sprite���κι��ܣ�������Ϊ������Щ���ⵥ�����ڵ�action��������

WGE.AnimationActionManager = WGE.Class(WGE.AnimationInterface2d,
{
	zIndex : -10000,

	initialize : function(startTime, endTime)
	{
		this.setAttrib(startTime, endTime);
		this.timeActions = [];
	},

	push : function()
	{
		this.timeActions.push.apply(this, arguments);
	},

	pushArr : function(arr)
	{
		this.timeActions.push.call(this.timeActions, arr);
	}

});


/*
// AnimationSprite ������ĳ��ʱ��εĶ�����
// AnimationSprite �� TimeActionInterface Ϊ������ϵ��
// һ�� AnimationSprite ����һ������ TimeActionInterface����������.
// AnimationSprite �������� ����action��ʼʱ�䣬���㶯����ʼ���߽���

//����ΪAnimationSprite ʵ��ԭ�ͣ�������һ��������sprite
WGE.AnimationSprite = WGE.Class(WGE.Sprite*, WGE.AnimationInterface2d,
{
	initialize : function(startTime, endTime, img, w, h)
	{
		this.setAttrib(startTime, endTime);
		this.timeActions = [];
		if(img)
		{
			this.initSprite(img, w, h);
		}
	}
});
*/

//ʱ����
WGE.TimeLine = WGE.Class(
{
	currentTime : 0.0,
	totalTime : 0.0,
	timeObjects : undefined,
	isStarted : false,
	//������ʼ��ȴ����Ƶ�����timeObjects(�Ѿ��������ƵĽ����޳�����)
	ObjectsWait2Render : undefined,
	//ÿһ֡Ҫ���Ƶ�timeObjects������zֵ���򣬲�ɸѡ������Ҫ���ƵĽڵ㡣
	Objects2Render : undefined, 

	initialize : function(totalTime)
	{
		this.totalTime = parseFloat(totalTime);
		this.timeObjects = [];
	},

	push : function()
	{
		this.timeObjects.push.apply(this.timeObjects, arguments);
		
		if(this.isStarted)
		{
			this.timeObjects.sort(function(a, b){
				return a.startTime - b.startTime;
			});
		}
	},

	pushArr : function(attribArr)
	{
		this.timeObjects.push.apply(this.timeObjects, attribArr);

		if(this.isStarted)
		{
			this.timeObjects.sort(function(a, b){
				return a.startTime - b.startTime;
			});
		}
	},

	clear : function()
	{
		this.timeObjects = [];
	},

	//startTime�ɲ��Ĭ��Ϊ0
	start : function(startTime)
	{
		this.isStarted = true;
		this.currentTime = parseFloat(startTime ? startTime : 0);

		this.timeObjects.sort(function(a, b){
			return a.startTime - b.startTime;
		});

		this.ObjectsWait2Render = WGE.clone(this.timeObjects);

		for(var i = 0; i != this.ObjectsWait2Render.length; ++i)
		{
			this.ObjectsWait2Render[i].timeStart();
		}
		this.Objects2Render = this.ObjectsWait2Render;
	},

	//��������������Ϊ����״̬
	end : function()
	{
		this.isStarted = false;
	},

	//����ʱ��仯���£��뱣֤ time > 0��
	//update֮ǰ���ȵ���start����ȷ�������ʼ����
	update : function(deltaTime)
	{
		if(!this.isStarted)
			return false;
		this.Objects2Render = [];
		this.currentTime += deltaTime;
		if(this.currentTime > this.totalTime)
			return false;
		
		var time = this.currentTime;
		var running = false;
		var len = this.ObjectsWait2Render.length;
		var hasDelete = false;

		for(var i = 0; i != len; ++i)
		{
			var anim = this.ObjectsWait2Render[i];
			if(!anim) continue;

			running = true;
						
			if(time >= anim.endTime)
			{
				anim.timeUp();
				//���������еĶ�������Ҫ��Ⱦ
				if(anim.render)
					this.Objects2Render.push(anim);
				delete this.ObjectsWait2Render[i];
				hasDelete = true;
			}
			else if(time > anim.startTime)
			{
				anim.run(time);
				this.Objects2Render.push(anim);
			}
			else break; //�����¼��Ѿ�ͨ����ʼʱ���������м�ĳһ���¼���ʼʱ��δ�ﵽ�������ľ�δ�ﵽ��
		}

		if(hasDelete)
		{
			var newArr = [];
			var arr = this.ObjectsWait2Render;
			for(var i = 0; i != len; ++i)
			{
				if(arr[i])
					newArr.push(arr[i]);
			}
			this.ObjectsWait2Render = newArr;
		}

		return running;
	},

	//������ת�� Ҫ������ʱ������в�ֵ���㣬�����ٶȽ���
	updateTo : function(currentTime)
	{

	},

	render : function(ctx)
	{
		this.Objects2Render.sort(function(a, b){return a.zIndex - b.zIndex;});
		for(var i = 0; i != this.Objects2Render.length; ++i)
		{
			var anim = this.Objects2Render[i];
			anim.render(ctx);
		}
	},

	getProgressRate : function()
	{
		return this.currentTime / this.totalTime;
	},

	getCurrentTime : function()
	{
		return this.currentTime;
	}

});

//../wgeGUI.js
"use strict";
/*
 * wgeGUI.js
 *
 *  Created on: 2014-6-23
 *      Author: Wang Yang
 *        blog: http://blog.wysaid.org
 */

/*
	��飺 �ṩ�򵥵Ľ���ӿ�.
*/

WGE.GUIInterface = WGE.Class(
{
	boundingWidth : undefined,
	boundingHeight : undefined,
	canvas : undefined,	
	father : undefined,
	fatherWidthName : ['width', 'clientWidth', 'offsetWidth'],
	fatherHeightName : ['height', 'clientHeight', 'offsetHeight'],
	resizeEvent : null, //Event����������û�����
	mouseMoveEvent : null, 
	mouseDownEvent : null,
	mouseUpEvent : null,
	mouseClickEvent : null,
	mouseDBLClickEvent : null,
	mouseOverEvent : null,
	mouseOutEvent : null,
	wheelEvent : null,
	keyDownEvent : null,
	keyUpEvent : null,
	keypressEvent : null,

	_animationRequest : null,
	startTime : 0,
	lastTime : 0,
	nowTime : 0,

	_forceAutoResize : false, //ǿ��resize�����ñ�Ǻ���ÿһ֡����Ƿ���Ҫresize

	 //����gui ���°�father����releaseʱ�������ԭ��father�İ󶨡�
	_events : null,

	initialize : function(fatherObj)
	{
		this.setupEvents();
		this.bindFather(fatherObj);
	},

	setupEvents : function()
	{
		//Mark : onresize ���������Ч��
		this._events = {
			'mousemove' : this.onmousemove.bind(this),
			'click' : this.onclick.bind(this),
			'mousedown' : this.onmousedown.bind(this),
			'mouseup' : this.onmouseup.bind(this),
			'dblclick' : this.ondblclick.bind(this),
			'mouseover' : this.onmouseover.bind(this),
			'mouseout' : this.onmouseout.bind(this),
			'keydown' : this.onkeydown.bind(this),
			'keypress' : this.onkeypress.bind(this),
			'keyup' : this.onkeyup.bind(this),
			//wheel ������firefox�в���֧�֡�
			'wheel' : this.onwheel.bind(this),
		};
		
		if(document.body.onwheel === undefined)
        {
        	this._events['mousewheel'] = this._events['wheel'];
        	this._events['wheel'] = undefined;
        }
	},

	release : function()
	{
		this.canvas = undefined;
		if(this.father && this.father.removeEventListener)
		{
			for(var i in _events)
			{
				this.father.removeEventListener(i, _events[i]);
			}
		}
		this.father = undefined;
	},

	//���������й����У�ǿ�ƶԽ��泤����м���ˢ�¡�
	//������Ѿ��ֶ���onresize �¼���ӵ� body��onresize�����У���û��Ҫ���á�
	forceAutoResize : function(flag)
	{
		this._forceAutoResize = flag;
	},

	isStarted : function()
	{
		return !!this._animationRequest;
	},

	start : function()
	{
		if(this._animationRequest)
		{
			console.warn("wgeGUI is already started!");
			return;
		}
//		this.onresize();
		this.startTime = Date.now();
		this.lastTime = this.startTime;
		this._animationRequest = requestAnimationFrame(this._run.bind(this));
	},

	stop : function()
	{
		if(this._animationRequest)
		{
			cancelAnimationFrame(this._animationRequest);
			this._animationRequest = null;
		}
	},

	_run : function()
	{
		if(this._forceAutoResize)
		{
			this.onresize();
		}

		this.nowTime = Date.now();
		var deltaTime = this.nowTime - this.lastTime;

		this.update(deltaTime);
		this.render(deltaTime);

		this.lastTime = this.nowTime;

		//�����_run����ִ���ڼ���ù�stop�����ټ�������frame.
		if(this._animationRequest)
			this._animationRequest = requestAnimationFrame(this._run.bind(this));
	},

	//update��render ���û��Զ��壬
	//����Ϊ����������һ��������ʾ���ε���֮��ļ��ʱ��(ms)
	update : function(deltaTime)
	{

	},

	render : function(deltaTime)
	{

	},

	//����canvasԪ�ز�֧�ֲ����¼�(�����stype���Եİٷֱȿ������ʵ�����ؿ��)��
	//��Ҫ�����󶨵�һ��֧�ִ����¼���DOM�ϣ���body, div��
	//���潫ռ������fatherԪ�أ��Ҹ���fatherԪ������Ӧ
	bindFather : function(fatherObj, width, height)
	{
		if(typeof fatherObj != 'object')
		{
			return false;
		}

		this.release();

		if(width && height)
		{
			this.boundingWidth = width;
			this.boundingHeight = height;
		}

		this.canvas = WGE.CE('canvas');
		fatherObj.appendChild(this.canvas);
		this.father = fatherObj;

        for(var eventName in this._events)
        {
        	fatherObj.addEventListener(eventName, this._events[eventName]);
        }

		var widthName = null, heightName = null;

		for(var i in this.fatherWidthName)
		{
			if(typeof fatherObj[this.fatherWidthName[i]] == 'number')
			{
				widthName = this.fatherWidthName[i];
				break;
			}
		}

		this.fatherWidthName = widthName;

		for(var i in this.fatherHeightName)
		{
			if(typeof fatherObj[this.fatherHeightName[i]] == 'number')
			{
				heightName = this.fatherHeightName[i];
				break;
			}
		}

		this.fatherHeightName = heightName;

		this.onresize();
		return true;
	},

	//�������ԣ����ִ󲿷�Ԫ�ز�֧��onresize, �����ֶ������body�С�
	onresize : function(e)
	{
		var cvs = this.canvas, father = this.father;

		var width = this.boundingWidth || father[this.fatherWidthName];
		var height = this.boundingHeight || father[this.fatherHeightName];

		//�� forceAutoResize ����ʱ��������Ч�����¼����á�		
		if(cvs.width != width || cvs.height != height) 
		{
			cvs.width = width;
			cvs.height = height;
			if(typeof this.resizeEvent == 'function')
				this.resizeEvent(e);
		}
	},

	onmousemove : function(e)
	{
		if(this.mouseMoveEvent)
		{
			this.mouseMoveEvent(e, e.offsetX || e.layerX, e.offsetY || e.layerY);
		}
	},

	onclick : function(e)
	{
		if(this.mouseClickEvent)
		{
			this.mouseClickEvent(e, e.offsetX || e.layerX, e.offsetY || e.layerY);
		}
	},

	onmousedown : function(e)
	{
		if(this.mouseDownEvent)
		{
			this.mouseDownEvent(e, e.offsetX || e.layerX, e.offsetY || e.layerY);
		}
	},

	onmouseup : function(e)
	{
		if(this.mouseUpEvent)
		{
			this.mouseUpEvent(e, e.offsetX || e.layerX, e.offsetY || e.layerY);
		}
	},

	ondblclick : function(e)
	{
		if(this.mouseDBLClickEvent)
		{
			this.mouseDBLClickEvent(e, e.offsetX || e.layerX, e.offsetY || e.layerY);
		}
	},

	onmouseover : function(e)
	{
		if(this.mouseOverEvent)
		{
			this.mouseOverEvent(e, e.offsetX || e.layerX, e.offsetY || e.layerY);
		}
	},

	onmouseout : function(e)
	{
		if(this.mouseOutEvent)
		{
			this.mouseOutEvent(e, e.offsetX || e.layerX, e.offsetY || e.layerY);
		}
	},

	onwheel : function(e)
	{
		if(this.wheelEvent)
		    this.wheelEvent(e, e.deltaY || e.wheelDelta);
	},

	//ע: ���divԪ���޷���Ӧkey�¼�����ܿ�������Ϊdiv�޷���ý��㣬������tabindex
	onkeydown : function()
	{
		if(this.keyDownEvent)
			this.keyDownEvent.apply(this, arguments);
	},

	onkeypress : function()
	{
		if(this.keypressEvent)
			this.keypressEvent.apply(this, arguments);
	},

	onkeyup : function()
	{
		if(this.keyUpEvent)
			this.keyUpEvent.apply(this, arguments);
	}

});

/*

##ʹ�÷�ʽ

��:

//��GUI��ռ��������Ļ�����������Ļ�л���С���
//�����갴�µĻ���С��㽫���Ƶ��������λ�á�

var myGUI = WGE.Class(WGE.GUIInterface, 
{
	context : undefined,
	x : 0,
	y : 0,
	isMouseDown : false,

	bindFather : function(fatherObj)
	{
		if(WGE.GUIInterface.bindFather.call(this, fatherObj));
		{
			this.context = this.canvas.getContext('2d');
			return !!this.context;
		}
		return false;
	},

	update : function()
	{
		if(!this.isMouseDown)
		{
			this.x = Math.random() * this.canvas.width;
			this.y = Math.random() * this.canvas.height;
		}
	},

	render : function()
	{
		var ctx = this.context;
		var cvs = this.canvas;
		ctx.clearRect(0, 0, cvs.width, cvs.height);
		this.context.fillStyle = "#f00";
		ctx.fillRect(this.x, this.y, 100, 100);
		ctx.fillText("click me!", 10, 10);
	},

	mouseDownEvent : function(e)
	{
		this.isMouseDown = true;
		this.x = e.x || e.offsetX;
		this.y = e.y || e.offsetY;
	},

	mouseUpEvent : function(e)
	{
		this.isMouseDown = false;
	},

	mouseMoveEvent : function(e)
	{
		if(this.isMouseDown)
		{
			this.x = e.offsetX || e.layerX;
			this.y = e.offsetY || e.layerY;
		}
	}
});

//// ���ô������£�

var gui = new myGUI(document.body);

//�������䶼��ʹ����ui��С���游Ԫ�ر仯���Ƽ�ǰ�ߡ����鷳���߸����д����г�ͻ������body��onresize�б�Ĵ������ʱ���ģ�д�ɺ���Ҳû��ϵ��
document.body.setAttribute("onresize", "gui.onresize(event);"); //�Ϻ�
//gui.forceAutoResize(true); //��һ�����һ�书�����ƣ����ַ����ɱ�֤��ȷ��

gui.start();

//// ��ô�����򵥰ɣ���

*/

//../wgeParticleSystem.js


//../wgeFont.js


//../2d/wgeSprite.js
"use strict";
/*
* wgeSprite.js for context-2d
*
*  Created on: 2014-7-25
*      Author: Wang Yang
*        Blog: http://blog.wysaid.org
*/

//LogicSprite �����������Ʒ��������ǿ�Ϊ��child����ṩ���λ��
WGE.LogicSprite = WGE.Class(WGE.SpriteInterface2d,
{
	pos : undefined,
	hotspot : undefined,
	size : undefined,
	scaling : undefined, // ����
	rotation : 0, // ��ת(����)
	alpha : 1, //͸����
	blendMode : undefined, //���ģʽ
	zIndex : 0, // ����canvas������֧��zֵ�����������zIndex�������������ݡ�

	initialize : function()
	{
		this.pos = new WGE.Vec2(0, 0);
		this.hotspot = new WGE.Vec2(0, 0);
		this.size = new WGE.Vec2(0, 0);
		this.scaling = new WGE.Vec2(1, 1);
	},

	setHotspot : function(hx, hy)
	{
		this.hotspot.data[0] = this.size.data[0] * (0.5 - hx/2);
		this.hotspot.data[1] = this.size.data[1] * (0.5 - hy/2);
	},

	setHotspot2Center : function()
	{
		this.hotspot.data[0] = this.size.data[0] / 2.0;
		this.hotspot.data[1] = this.size.data[1] / 2.0;
	},

	setHotspotWithRatio : function(rx, ry)
	{
		this.hotspot.data[0] = this.size.data[0] * rx;
		this.hotspot.data[1] = this.size.data[1] * ry;
	},

	//����ڱ�sprite��������
	setHotspotWithPixel : function(px, py)
	{
		this.hotspot.data[0] = hx;
		this.hotspot.data[1] = hy;
	},

	move : function(dx, dy)
	{
		this.pos.data[0] += dx;
		this.pos.data[1] += dy;
	},

	moveTo : function(x, y)
	{
		this.pos.data[0] = x;
		this.pos.data[1] = y;
	},

	moveWithRatio : function(rdx, rdy)
	{
		this.pos.data[0] += rdx * this.size.data[0];
		this.pos.data[1] += rdy * this.size.data[1];
	},

	moveToWithRatio : function(rx, ry)
	{
		this.pos.data[0] = rx * this.size.data[0];
		this.pos.data[1] = ry * this.size.data[1];
	},

	scale : function(sx, sy)
	{
		this.scaling.data[0] *= sx;
		this.scaling.data[1] *= sy;
	},

	scaleTo : function(sx, sy)
	{
		this.scaling.data[0] = sx;
		this.scaling.data[1] = sy;
	},

	rotate : function(dRot)
	{
		this.rotation += dRot;
	},

	rotateTo : function(rot)
	{
		this.rotation = rot;
	},

	//��sprite��Ⱦ��ָ����context
	render : function(ctx)
	{
		ctx.save();
		ctx.translate(this.pos.data[0], this.pos.data[1]);
		if(this.rotation)
			ctx.rotate(this.rotation);

		ctx.scale(this.scaling.data[0], this.scaling.data[1]);

		ctx.globalAlpha *= this.alpha;		
		if(this.blendMode)
			ctx.globalCompositeOperation = this.blendMode;

		for(var i in this.childSprites)
		{
			this.childSprites[i].render(ctx);
		}
		ctx.restore();
	},

	renderTo : function(ctx, pos, rot, scaling, alpha, blendmode)
	{		
		ctx.save();
		ctx.translate(pos.data[0], pos.data[1]);
		if(rot)
			ctx.rotate(rot);
		if(scaling)
			ctx.scale(scaling.data[0], scaling.data[1]);
		if(alpha)
			ctx.globalAlpha = alpha;
		if(blendmode)
			ctx.globalCompositeOperation = blendmode;

		for(var i in this.childSprites)
		{
			this.childSprites[i].render(ctx);
		}
		ctx.restore();
	}


});

//
// �·��ṩ��Ⱦ�ٶȽϿ�� SpriteExt, ������ת������Ҫ���о������㣬������
// �뿼�ǳ����ۺ�ѡ��
//
WGE.Sprite = WGE.Class(WGE.LogicSprite,
{
	img : null,  // Sprite����ͼ��

	initialize : function(img, w, h)
	{
		this.pos = new WGE.Vec2(0, 0);
		this.hotspot = new WGE.Vec2(0, 0);
		this.size = new WGE.Vec2(0, 0);
		this.scaling = new WGE.Vec2(1, 1);
		this.initSprite(img, w, h);
	},

	// �� imgֱ��ʹ��image����canvas����ʱ��
	// ��w����Ϊ��ֵ ��ʹSprite�����ô˶��󣬼����ڴ�ռ�á�
	initSprite : function(img, w, h)
	{
		if(!img)
			return false;

		if(typeof img == 'string')
		{
			img = WGE.ID(img);
		}
		else if(w < 0 && typeof img == 'object')
		{
			this.img = img;
			this.size.data[0] = img.width;
			this.size.data[1] = img.height;
			return;
		}

		this.img = WGE.CE('canvas');
		if(img)
		{
			if(w && h)
			{
				this.size.data[0] = w;
				this.size.data[1] = h;
				this.img.width = w;
				this.img.height = h;
			}
			else
			{
				this.size.data[0] = img.width;
				this.size.data[1] = img.height;
				this.img.width = img.width;
				this.img.height = img.height;
			}

			var ctx = this.img.getContext('2d');
			ctx.drawImage(img, 0, 0, this.img.width, this.img.height, 0, 0, img.width, img.height);
		}
	},

	//��sprite��Ⱦ��ָ����context
	render : function(ctx)
	{
		ctx.save();
		ctx.translate(this.pos.data[0], this.pos.data[1]);
		if(this.rotation)
			ctx.rotate(this.rotation);

		ctx.scale(this.scaling.data[0], this.scaling.data[1]);

		ctx.globalAlpha *= this.alpha;		
		if(this.blendMode)
			ctx.globalCompositeOperation = this.blendMode;

		ctx.drawImage(this.img, -this.hotspot.data[0], -this.hotspot.data[1]);

		for(var i in this.childSprites)
		{
			this.childSprites[i].render(ctx);
		}
		ctx.restore();
	},

	renderTo : function(ctx, pos, rot, scaling, alpha, blendmode)
	{		
		ctx.save();
		ctx.translate(pos.data[0], pos.data[1]);
		if(rot)
			ctx.rotate(rot);

		if(scaling)
			ctx.scale(scaling.data[0], scaling.data[1]);
		if(alpha)
			ctx.globalAlpha = alpha;
		if(blendmode)
			ctx.globalCompositeOperation = blendmode;
		ctx.drawImage(this.img, -this.hotspot.data[0], pos.data[1] -this.hotspot.data[1]);

		for(var i in this.childSprites)
		{
			this.childSprites[i].render(ctx);
		}
		ctx.restore();
	}
});


//ʹ�þ�����������תƽ�����ŵȡ�
//WGE.SpriteExt ���нϿ����Ⱦ�ٶȣ��������Ƶ����ת�Ļ���Ч�ʲ��ߡ�
//������Ҫ��ת��������ÿһ֡����Ҫ��ת�������ʹ�á�
WGE.SpriteExt = WGE.Class(WGE.Sprite,
{
	rot : null, //2x2����
	rotation : 0, //�ر�ע��, rotation ������ת��һ����¼������Ӱ����תֵ��

	initialize : function(img, w, h)
	{
		WGE.Sprite.apply(this, arguments);
		this.rot = new WGE.mat2Identity();
	},

	//����תƽ�����ź͵�һ�� transform ��������Ⱦ�ٶȽϿ졣
	render : function(ctx)
	{
		ctx.save();
		var m = this.rot.data;
		ctx.transform(m[0] * this.scaling.data[0], m[1], m[2] * this.scaling.data[1], m[3], this.pos.data[0], this.pos.data[1]);
		ctx.globalAlpha *= this.alpha;		
		if(this.blendMode)
			ctx.globalCompositeOperation = this.blendMode;

		ctx.drawImage(this.img, -this.hotspot.data[0], -this.hotspot.data[1]);

		for(var i in this.childSprites)
		{
			this.childSprites[i].render(ctx);
		}
		ctx.restore();
	},

	rotate : function(dRot)
	{
		this.rot.rotate(dRot);
		this.rotation += dRot;
	},

	rotateTo : function(rot)
	{
		this.rot = WGE.mat2Rotation(rot);
		this.rotation = rot;
	}

});


//�Ӻ�ʵ�֣�ʹ��2d canvasģ��3d
//��Ҫ���þ�������������Ⱦ�����꣬���canvas�Դ��� transform ת��
WGE.SpriteExt3d = WGE.Class(WGE.Sprite,
{

});

//../2d/wgeFilters.js
"use strict";
/*
* wgeFilters.js for context-2d
*
*  Created on: 2014-8-2
*      Author: Wang Yang
*        Blog: http://blog.wysaid.org
*        Mail: admin@wysaid.org
*/

/*
	��飺 �ṩ��context-2d�����µļ�CPU�˾�
*/

WGE.FilterInterface = WGE.Class(
{
	canvasObject : undefined,
	imageData : undefined,

	//img ������image�������canvas����
	initialize : function(img)
	{
		this.bind(img);
	},

	bind : function(img, x, y, w, h)
	{
		if(!img)
			return null;

		if(!(x && y && w && h))
		{
			x = y = 0;
			w = img.width;
			h = img.height;
		}

		if(img.getContext)
		{
			this.canvasObject = img;
			this.imageData = img.getContext("2d").getImageData(x, y, w, h);
		}
		else
		{
			this.canvasObject = WGE.CE('canvas');
			this.canvasObject.width = w;
			this.canvasObject.height = h;
			var ctx = this.canvasObject.getContext('2d');
			ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
			this.imageData = ctx.getImageData(0, 0, w, h);
		}
		return this;
	},

	//noCopy sets "the src and dst are the same canvas".
	run : function(args, noCopy)
	{
		var dst = null;
		if(this.canvasObject && this.imageData)
		{
			//������noCopy��ʱ�򣬿���������ͬһ��canvasִ��һϵ���˾���
			if(noCopy)
			{
				this._run(this.imageData.data, this.imageData.data, this.canvasObject.width, this.canvasObject.height, args)
				this.canvasObject.getContext("2d").putImageData(this.imageData, 0, 0);
			}
			else
			{
				dst = WGE.CE('canvas');
				dst.width = this.canvasObject.width;
				dst.height = this.canvasObject.height;
				var ctx = dst.getContext('2d');
				var dstImageData = ctx.getImageData(0, 0, dst.width, dst.height);
				this._run(dstImageData.data, this.imageData.data, dst.width, dst.height, args);
				ctx.putImageData(dstImageData, 0, 0);
			}
		}

		if(noCopy)
			return this.canvasObject;
		return dst;
	},

	_run : function(dst, src, w, h)
	{
		//Do nothing.
	}

});

WGE.Filter = {};

WGE.Filter.Monochrome = WGE.Class(WGE.FilterInterface,
{
	_run : function(dst, src, w, h)
	{
		var len = w * h * 4;
		for(var i = 0; i < len; i += 4)
		{
			var gray = (src[i] * 4899 + src[i + 1] * 9617 + src[i + 2] * 1868 + 8192) >> 14;
			dst[i] = dst[i + 1] = dst[i + 2] = gray;
			dst[i + 3] = src[i + 3];
		}
	}
});

WGE.Filter.Edge = WGE.Class(WGE.FilterInterface,
{
	_run : function(dst, src, w, h)
	{

		var func = function(v)
		{
			return Math.max(Math.min(v * 2.0, 255), 0);
		}

		var lw = w - 2, lh = h - 2;
		for(var i = 0; i < lh; ++i)
		{
			var line = i * w * 4;
			for(var j = 0; j < lw; ++j)
			{
				var index1 = line + j * 4;
				var index2 = index1 + w * 8 + 8;
				dst[index1] = func(src[index1] - src[index2]);
				dst[index1 + 1] = func(src[index1 + 1] - src[index2 + 1]);
				dst[index1 + 2] = func(src[index1 + 2] - src[index2 + 2]);
				dst[index1 + 3] = src[index1 + 3];
			}
		}
	}
});

WGE.Filter.StackBlur = WGE.Class(WGE.FilterInterface,
{
	run : function(args, noCopy)
	{
		var dst = null;
		if(this.canvasObject && this.imageData)
		{
			//������noCopy��ʱ�򣬿���������ͬһ��canvasִ��һϵ���˾���
			if(noCopy)
			{
				this._run(this.imageData.data, this.canvasObject.width, this.canvasObject.height, args)
				this.canvasObject.getContext("2d").putImageData(this.imageData, 0, 0);
			}
			else
			{
				dst = WGE.CE('canvas');
				dst.width = this.canvasObject.width;
				dst.height = this.canvasObject.height;
				var ctx = dst.getContext('2d');
				this._run(this.imageData.data, dst.width, dst.height, args);
				ctx.putImageData(this.imageData, 0, 0);
			}
		}

		if(noCopy)
			return this.canvasObject;
		return dst;
	},

	_run : function(pixels, width, height, args)
	{
		var top_x = 0, top_y = 0;
		var radius = args[0];

		if ( isNaN(radius) || radius < 1 ) return;
		radius |= 0;

		var x, y, i, p, yp, yi, yw, r_sum, g_sum, b_sum,
		r_out_sum, g_out_sum, b_out_sum,
		r_in_sum, g_in_sum, b_in_sum,
		pr, pg, pb, rbs;

		var div = radius + radius + 1;
		var w4 = width << 2;
		var widthMinus1  = width - 1;
		var heightMinus1 = height - 1;
		var radiusPlus1  = radius + 1;
		var sumFactor = radiusPlus1 * ( radiusPlus1 + 1 ) / 2;

		var stackStart = new WGE.Filter.StackBlur.BlurStack();
		var stack = stackStart;
		var stackEnd;
		for ( i = 1; i < div; i++ )
		{
			stack = stack.next = new WGE.Filter.StackBlur.BlurStack();
			if ( i == radiusPlus1 ) stackEnd = stack;
		}
		stack.next = stackStart;
		var stackIn = null;
		var stackOut = null;

		yw = yi = 0;

		var mul_sum = WGE.Filter.StackBlur.mul_table[radius];
		var shg_sum = WGE.Filter.StackBlur.shg_table[radius];

		for ( y = 0; y < height; y++ )
		{
			r_in_sum = g_in_sum = b_in_sum = r_sum = g_sum = b_sum = 0;

			r_out_sum = radiusPlus1 * ( pr = pixels[yi] );
			g_out_sum = radiusPlus1 * ( pg = pixels[yi+1] );
			b_out_sum = radiusPlus1 * ( pb = pixels[yi+2] );

			r_sum += sumFactor * pr;
			g_sum += sumFactor * pg;
			b_sum += sumFactor * pb;

			stack = stackStart;

			for( i = 0; i < radiusPlus1; i++ )
			{
				stack.r = pr;
				stack.g = pg;
				stack.b = pb;
				stack = stack.next;
			}

			for( i = 1; i < radiusPlus1; i++ )
			{
				p = yi + (( widthMinus1 < i ? widthMinus1 : i ) << 2 );
				r_sum += ( stack.r = ( pr = pixels[p])) * ( rbs = radiusPlus1 - i );
				g_sum += ( stack.g = ( pg = pixels[p+1])) * rbs;
				b_sum += ( stack.b = ( pb = pixels[p+2])) * rbs;

				r_in_sum += pr;
				g_in_sum += pg;
				b_in_sum += pb;

				stack = stack.next;
			}


			stackIn = stackStart;
			stackOut = stackEnd;
			for ( x = 0; x < width; x++ )
			{
				pixels[yi]   = (r_sum * mul_sum) >> shg_sum;
				pixels[yi+1] = (g_sum * mul_sum) >> shg_sum;
				pixels[yi+2] = (b_sum * mul_sum) >> shg_sum;

				r_sum -= r_out_sum;
				g_sum -= g_out_sum;
				b_sum -= b_out_sum;

				r_out_sum -= stackIn.r;
				g_out_sum -= stackIn.g;
				b_out_sum -= stackIn.b;

				p =  ( yw + ( ( p = x + radius + 1 ) < widthMinus1 ? p : widthMinus1 ) ) << 2;

				r_in_sum += ( stackIn.r = pixels[p]);
				g_in_sum += ( stackIn.g = pixels[p+1]);
				b_in_sum += ( stackIn.b = pixels[p+2]);

				r_sum += r_in_sum;
				g_sum += g_in_sum;
				b_sum += b_in_sum;

				stackIn = stackIn.next;

				r_out_sum += ( pr = stackOut.r );
				g_out_sum += ( pg = stackOut.g );
				b_out_sum += ( pb = stackOut.b );

				r_in_sum -= pr;
				g_in_sum -= pg;
				b_in_sum -= pb;

				stackOut = stackOut.next;

				yi += 4;
			}
			yw += width;
		}


		for ( x = 0; x < width; x++ )
		{
			g_in_sum = b_in_sum = r_in_sum = g_sum = b_sum = r_sum = 0;

			yi = x << 2;
			r_out_sum = radiusPlus1 * ( pr = pixels[yi]);
			g_out_sum = radiusPlus1 * ( pg = pixels[yi+1]);
			b_out_sum = radiusPlus1 * ( pb = pixels[yi+2]);

			r_sum += sumFactor * pr;
			g_sum += sumFactor * pg;
			b_sum += sumFactor * pb;

			stack = stackStart;

			for( i = 0; i < radiusPlus1; i++ )
			{
				stack.r = pr;
				stack.g = pg;
				stack.b = pb;
				stack = stack.next;
			}

			yp = width;

			for( i = 1; i <= radius; i++ )
			{
				yi = ( yp + x ) << 2;

				r_sum += ( stack.r = ( pr = pixels[yi])) * ( rbs = radiusPlus1 - i );
				g_sum += ( stack.g = ( pg = pixels[yi+1])) * rbs;
				b_sum += ( stack.b = ( pb = pixels[yi+2])) * rbs;

				r_in_sum += pr;
				g_in_sum += pg;
				b_in_sum += pb;

				stack = stack.next;

				if( i < heightMinus1 )
				{
					yp += width;
				}
			}

			yi = x;
			stackIn = stackStart;
			stackOut = stackEnd;
			for ( y = 0; y < height; y++ )
			{
				p = yi << 2;
				pixels[p]   = (r_sum * mul_sum) >> shg_sum;
				pixels[p+1] = (g_sum * mul_sum) >> shg_sum;
				pixels[p+2] = (b_sum * mul_sum) >> shg_sum;

				r_sum -= r_out_sum;
				g_sum -= g_out_sum;
				b_sum -= b_out_sum;

				r_out_sum -= stackIn.r;
				g_out_sum -= stackIn.g;
				b_out_sum -= stackIn.b;

				p = ( x + (( ( p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1 ) * width )) << 2;

				r_sum += ( r_in_sum += ( stackIn.r = pixels[p]));
				g_sum += ( g_in_sum += ( stackIn.g = pixels[p+1]));
				b_sum += ( b_in_sum += ( stackIn.b = pixels[p+2]));

				stackIn = stackIn.next;

				r_out_sum += ( pr = stackOut.r );
				g_out_sum += ( pg = stackOut.g );
				b_out_sum += ( pb = stackOut.b );

				r_in_sum -= pr;
				g_in_sum -= pg;
				b_in_sum -= pb;

				stackOut = stackOut.next;

				yi += width;
			}
		}
	},

	stackBlurCanvasRGB : function(canvas, top_x, top_y, width, height, radius)
	{
		if ( isNaN(radius) || radius < 1 ) 
			radius = 10;
		radius |= 0;

		var context = canvas.getContext("2d");
		var imageData;

		try {
			try {
				imageData = context.getImageData( top_x, top_y, width, height );
			} catch(e) {

				try {
					netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
					imageData = context.getImageData( top_x, top_y, width, height );
				} catch(e) {
					alert("Cannot access local image");
					throw new Error("unable to access local image data: " + e);
					return;
				}
			}
		} catch(e) {
			alert("Cannot access image");
			throw new Error("unable to access image data: " + e);
		}

		var pixels = imageData.data;

		var x, y, i, p, yp, yi, yw, r_sum, g_sum, b_sum,
		r_out_sum, g_out_sum, b_out_sum,
		r_in_sum, g_in_sum, b_in_sum,
		pr, pg, pb, rbs;

		var div = radius + radius + 1;
		var w4 = width << 2;
		var widthMinus1  = width - 1;
		var heightMinus1 = height - 1;
		var radiusPlus1  = radius + 1;
		var sumFactor = radiusPlus1 * ( radiusPlus1 + 1 ) / 2;

		var stackStart = new WGE.Filter.StackBlur.BlurStack();
		var stack = stackStart;
		for ( i = 1; i < div; i++ )
		{
			stack = stack.next = new WGE.Filter.StackBlur.BlurStack();
			if ( i == radiusPlus1 ) var stackEnd = stack;
		}
		stack.next = stackStart;
		var stackIn = null;
		var stackOut = null;

		yw = yi = 0;

		var mul_sum = WGE.Filter.StackBlur.mul_table[radius];
		var shg_sum = WGE.Filter.StackBlur.shg_table[radius];

		for ( y = 0; y < height; y++ )
		{
			r_in_sum = g_in_sum = b_in_sum = r_sum = g_sum = b_sum = 0;

			r_out_sum = radiusPlus1 * ( pr = pixels[yi] );
			g_out_sum = radiusPlus1 * ( pg = pixels[yi+1] );
			b_out_sum = radiusPlus1 * ( pb = pixels[yi+2] );

			r_sum += sumFactor * pr;
			g_sum += sumFactor * pg;
			b_sum += sumFactor * pb;

			stack = stackStart;

			for( i = 0; i < radiusPlus1; i++ )
			{
				stack.r = pr;
				stack.g = pg;
				stack.b = pb;
				stack = stack.next;
			}

			for( i = 1; i < radiusPlus1; i++ )
			{
				p = yi + (( widthMinus1 < i ? widthMinus1 : i ) << 2 );
				r_sum += ( stack.r = ( pr = pixels[p])) * ( rbs = radiusPlus1 - i );
				g_sum += ( stack.g = ( pg = pixels[p+1])) * rbs;
				b_sum += ( stack.b = ( pb = pixels[p+2])) * rbs;

				r_in_sum += pr;
				g_in_sum += pg;
				b_in_sum += pb;

				stack = stack.next;
			}


			stackIn = stackStart;
			stackOut = stackEnd;
			for ( x = 0; x < width; x++ )
			{
				pixels[yi]   = (r_sum * mul_sum) >> shg_sum;
				pixels[yi+1] = (g_sum * mul_sum) >> shg_sum;
				pixels[yi+2] = (b_sum * mul_sum) >> shg_sum;

				r_sum -= r_out_sum;
				g_sum -= g_out_sum;
				b_sum -= b_out_sum;

				r_out_sum -= stackIn.r;
				g_out_sum -= stackIn.g;
				b_out_sum -= stackIn.b;

				p =  ( yw + ( ( p = x + radius + 1 ) < widthMinus1 ? p : widthMinus1 ) ) << 2;

				r_in_sum += ( stackIn.r = pixels[p]);
				g_in_sum += ( stackIn.g = pixels[p+1]);
				b_in_sum += ( stackIn.b = pixels[p+2]);

				r_sum += r_in_sum;
				g_sum += g_in_sum;
				b_sum += b_in_sum;

				stackIn = stackIn.next;

				r_out_sum += ( pr = stackOut.r );
				g_out_sum += ( pg = stackOut.g );
				b_out_sum += ( pb = stackOut.b );

				r_in_sum -= pr;
				g_in_sum -= pg;
				b_in_sum -= pb;

				stackOut = stackOut.next;

				yi += 4;
			}
			yw += width;
		}


		for ( x = 0; x < width; x++ )
		{
			g_in_sum = b_in_sum = r_in_sum = g_sum = b_sum = r_sum = 0;

			yi = x << 2;
			r_out_sum = radiusPlus1 * ( pr = pixels[yi]);
			g_out_sum = radiusPlus1 * ( pg = pixels[yi+1]);
			b_out_sum = radiusPlus1 * ( pb = pixels[yi+2]);

			r_sum += sumFactor * pr;
			g_sum += sumFactor * pg;
			b_sum += sumFactor * pb;

			stack = stackStart;

			for( i = 0; i < radiusPlus1; i++ )
			{
				stack.r = pr;
				stack.g = pg;
				stack.b = pb;
				stack = stack.next;
			}

			yp = width;

			for( i = 1; i <= radius; i++ )
			{
				yi = ( yp + x ) << 2;

				r_sum += ( stack.r = ( pr = pixels[yi])) * ( rbs = radiusPlus1 - i );
				g_sum += ( stack.g = ( pg = pixels[yi+1])) * rbs;
				b_sum += ( stack.b = ( pb = pixels[yi+2])) * rbs;

				r_in_sum += pr;
				g_in_sum += pg;
				b_in_sum += pb;

				stack = stack.next;

				if( i < heightMinus1 )
				{
					yp += width;
				}
			}

			yi = x;
			stackIn = stackStart;
			stackOut = stackEnd;
			for ( y = 0; y < height; y++ )
			{
				p = yi << 2;
				pixels[p]   = (r_sum * mul_sum) >> shg_sum;
				pixels[p+1] = (g_sum * mul_sum) >> shg_sum;
				pixels[p+2] = (b_sum * mul_sum) >> shg_sum;

				r_sum -= r_out_sum;
				g_sum -= g_out_sum;
				b_sum -= b_out_sum;

				r_out_sum -= stackIn.r;
				g_out_sum -= stackIn.g;
				b_out_sum -= stackIn.b;

				p = ( x + (( ( p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1 ) * width )) << 2;

				r_sum += ( r_in_sum += ( stackIn.r = pixels[p]));
				g_sum += ( g_in_sum += ( stackIn.g = pixels[p+1]));
				b_sum += ( b_in_sum += ( stackIn.b = pixels[p+2]));

				stackIn = stackIn.next;

				r_out_sum += ( pr = stackOut.r );
				g_out_sum += ( pg = stackOut.g );
				b_out_sum += ( pb = stackOut.b );

				r_in_sum -= pr;
				g_in_sum -= pg;
				b_in_sum -= pb;

				stackOut = stackOut.next;

				yi += width;
			}
		}
		return imageData;	
	}
});

WGE.Filter.StackBlur.mul_table = [
512,512,456,512,328,456,335,512,405,328,271,456,388,335,292,512,
454,405,364,328,298,271,496,456,420,388,360,335,312,292,273,512,
482,454,428,405,383,364,345,328,312,298,284,271,259,496,475,456,
437,420,404,388,374,360,347,335,323,312,302,292,282,273,265,512,
497,482,468,454,441,428,417,405,394,383,373,364,354,345,337,328,
320,312,305,298,291,284,278,271,265,259,507,496,485,475,465,456,
446,437,428,420,412,404,396,388,381,374,367,360,354,347,341,335,
329,323,318,312,307,302,297,292,287,282,278,273,269,265,261,512,
505,497,489,482,475,468,461,454,447,441,435,428,422,417,411,405,
399,394,389,383,378,373,368,364,359,354,350,345,341,337,332,328,
324,320,316,312,309,305,301,298,294,291,287,284,281,278,274,271,
268,265,262,259,257,507,501,496,491,485,480,475,470,465,460,456,
451,446,442,437,433,428,424,420,416,412,408,404,400,396,392,388,
385,381,377,374,370,367,363,360,357,354,350,347,344,341,338,335,
332,329,326,323,320,318,315,312,310,307,304,302,299,297,294,292,
289,287,285,282,280,278,275,273,271,269,267,265,263,261,259];


WGE.Filter.StackBlur.shg_table = [
9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17, 
17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19, 
19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20,
20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21,
21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21,
21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 
22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22,
22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23, 
23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 
23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 
24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24 ];

WGE.Filter.StackBlur.BlurStack = function()
{
	this.r = 0;
	this.g = 0;
	this.b = 0;
	this.a = 0;
	this.next = null;
};

//../2d/wgeSlideshow.js
"use strict";
/*
* wgeSlideshow.js
*
*  Created on: 2014-8-14
*      Author: Wang Yang
*        Blog: http://blog.wysaid.org
*/

/*
��飺��Ҫ�ṩ����վ������ݵĽӿ���ƣ�
      �Լ��ṩ����json�����ļ��Ľ����ӿڡ�
*/


//�ر�ע�⣬ SlideshowSettings �����width��height����slideshow�㷨�õ���ʵ�ʿ�ߣ���ȷ������
//style����Ŀ������ʾʱ�Ŀ�ߣ�ϵͳ���Զ�����������ʾ��
//������slideshow��������κ�������Ķ�̬�趨��ߵĴ��룬�˷����ܡ�

WGE.SlideshowSettings = 
{
	assetsDir : "",  //���ֵ���Դ�����ļ���
	width : 1024,
	height : 768,
	style : "width:100%;height:100%"
};

if(window.soundManager && window.soundManager.onready)
{
	soundManager.onready(function(){
		WGE.soundManagerReady = true;
		console.log("WGE SM2 Ready");
	});
}

//�������Ӻ����������� ��Ĭ��ͳһ�淶��slideshowʹ�÷ֱ���Ϊ 1024*768
//���������ȱ�����ͼƬ����ʹͼƬ����߸���������ֱ��ʲ�����һ�ߴ��ڵ�������ֱ��ʡ�
//�磺 ͼƬ�ֱ���Ϊ 1024 * 1024�� ��ͼƬ����
//     ͼƬ�ֱ���Ϊ 768 * 768�� �򽫵ȱ�����Ϊ 1024 * 1024
//     ͼƬ�ֱ���Ϊ 1024 * 500�� �򽫵ȱ�����Ϊ 1573 * 768
// ������������ʾ���ֱ�����С������ߴ磬 �ɸ���ʵ�������趨��
WGE.slideshowFitImages = function(imgs, w, h)
{
	if(!(w && h))
	{
		w = 1024;
		h = 768;
	}
	else
	{
		w *= WGE.SlideshowSettings.width;
		h *= WGE.SlideshowSettings.height;
	}

	var fitImgs = [];

	for(var i = 0; i != imgs.length; ++i)
	{
		var img = imgs[i];
		var canvas = WGE.CE('canvas');
		var scale = Math.min(img.width / w, img.height / h);
		canvas.width = img.width / scale;
		canvas.height = img.height / scale;
		canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
		fitImgs.push(canvas);
	}
	return fitImgs;
};

WGE.slideshowFitImage = function(img, w, h)
{
	if(!(w && h))
	{
		w = 1024;
		h = 768;
	}
	else
	{
		w *= WGE.SlideshowSettings.width;
		h *= WGE.SlideshowSettings.height;
	}

	var canvas = WGE.CE('canvas');
	var scale = Math.min(img.width / w, img.height / h);
	canvas.width = img.width / scale;
	canvas.height = img.height / scale;
	canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
	return canvas;
};

WGE.imagesFitSlideshow = function(imgs, w, h)
{
	if(!(w && h))
	{
		w = 1024;
		h = 768;
	}
	else
	{
		w *= WGE.SlideshowSettings.width;
		h *= WGE.SlideshowSettings.height;
	}

	var fitImgs = [];

	for(var i = 0; i != imgs.length; ++i)
	{
		var img = imgs[i];
		var canvas = WGE.CE('canvas');
		var scale = Math.max(img.width / w, img.height / h);
		canvas.width = img.width / scale;
		canvas.height = img.height / scale;
		canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
		fitImgs.push(canvas);
	}
	return fitImgs;
}

if(WGE.Sprite && WGE.AnimationWithChildrenInterface2d)
{
	//ע�� initialize ĩβ������������� w Ϊ-1�� ��ʾimg ������������ʹ��
	WGE.SlideshowAnimationSprite = WGE.Class(WGE.Sprite, WGE.AnimationWithChildrenInterface2d,
	{
		initialize : function(startTime, endTime, img, w, h)
		{
			WGE.AnimationWithChildrenInterface2d.initialize.call(this, startTime, endTime);
			WGE.Sprite.initialize.call(this, img, w, h);
		}
	});

	WGE.SlideshowAnimationLogicSprite = WGE.Class(WGE.LogicSprite, WGE.AnimationWithChildrenInterface2d,
	{
		initialize : function(startTime, endTime)
		{
			WGE.AnimationWithChildrenInterface2d.initialize.call(this, startTime, endTime);
			WGE.LogicSprite.initialize.call(this);
		}
	});
}


WGE.SlideshowInterface = WGE.Class(
{
	audioFileName : "", //�����ļ���
	musicDuration : 60000, //�����ļ�����ʱ��
	audio : null,
	audioPlayedTimes : 0, //���ֱ��ظ����Ŵ���
	timeline : null, //����slideshow��ʱ����.

	father : null, //����Ŀ�����ڵ�DOM
	canvas : null, //����Ŀ��
	context : null, //����Ŀ���context

	srcImages : null,  //canvas���͵����顣
	config : null, //slideshow����(json)

	_animationRequest : null,  //����ÿһ�εĶ������󣬵�pause����stopʱ���Լ�ʱֹͣ��
	_lastFrameTime : null, //����ÿһִ֡����֮���ʱ�䡣
	_loopFunc : null, // mainloop.bind(this)
	_audioplayingTime : 0, //����ʱ��
	_endCanvas : null, //��������
	_endBlurCanvas : null, //����ģ������

	//ע�⣺ ��initializeĩβ������Ĺ��캯�����ݽ�����ĩβִ���Ǻܲ��õ���Ϊ
	//��ֱ������������ִ�С� ���ⲻ��Ҫ���߼����䣬�Ӵ�ά��ʱ���鷳��
	//config������ʾslideshow�������ļ��� Ĭ�Ͻ���config���н��������Ĭ�Ϸ����޷�������
	//����д�Լ���ʵ��
	//ĩβ��canvas��context������ѡ�� �����д��ֱ�ӽ�����Ŀ������Ϊĩβ����ָ����canvas(��Ҫ����demo)
	initialize : function(fatherDOM, imgURLs, finishCallback, eachCallback, imageRatioX, imageRatioY, config,  canvas, context)
	{
		this.father = fatherDOM;
		this.canvas = canvas;
		if(!this.canvas)
		{
			this.canvas = WGE.CE('canvas');
			this.canvas.width = WGE.SlideshowSettings.width;
			this.canvas.height = WGE.SlideshowSettings.height;
			this.canvas.setAttribute("style", WGE.SlideshowSettings.style);
			this.father.appendChild(this.canvas);
		}		

		this.context = context || this.canvas.getContext('2d');
		
		if(config)
			this.config = config;

		this._loadImages(imgURLs, finishCallback, eachCallback, imageRatioX, imageRatioY);

		var audioFileNames;
		if(this.audioFileName instanceof Array)
		{
			audioFileNames = [];
			for(var i in this.audioFileName)
				audioFileNames.push(WGE.SlideshowSettings.assetsDir + this.audioFileName[i]);
		}
		else if(this.audioFileName) 
			audioFileNames = WGE.SlideshowSettings.assetsDir + this.audioFileName;

		if(audioFileNames)
			this.audioFileName = audioFileNames;

		if(this.audioFileName)
		{
			if(this.audioFileName instanceof Array)
			{
				audioFileNames = [];
				for(var i in this.audioFileName)
					audioFileNames.push(WGE.SlideshowSettings.assetsDir + this.audioFileName[i]);
			}
			else audioFileNames = WGE.SlideshowSettings.assetsDir + this.audioFileName;
			this._initAudio(audioFileNames);
		}
	},

	//config Ϊjson�����ļ�
	initTimeline : function(config)
	{
		WGE.SlideshowParsingEngine.parse(config, this);

		if(!this.audio)
		{
			var audioFileNames;
			if(this.audioFileName instanceof Array)
			{
				audioFileNames = [];
				for(var i in this.audioFileName)
					audioFileNames.push(WGE.SlideshowSettings.assetsDir + this.audioFileName[i]);
			}
			else audioFileNames = WGE.SlideshowSettings.assetsDir + this.audioFileName;
			this._initAudio(audioFileNames);
			return ;
		}
	},

	_loadImages : function(imgURLs, finishCallback, eachCallback, imageRatioX, imageRatioY)
	{
		var self = this;
		WGE.loadImages(imgURLs, function(imgArr) {
			self.srcImages = WGE.slideshowFitImages(imgArr, imageRatioX, imageRatioY);

			if(self.config)
				self.initTimeline(self.config);
			if(finishCallback)
				finishCallback(self.srcImages, self);

			self.config = null;
		}, function(img, n) {
			if(eachCallback)
				eachCallback(img, n, self);
		});
	},

	//��Ҫ������ soundManager
	_initAudio : function(url)
	{
		var self = this;
		var arg = {url : url};

		if(typeof this._audioFinish == "function")
			arg.onfinish = this._audioFinish.bind(this);

		if(typeof this._audioplaying == "function")
			arg.whileplaying = this._audioplaying.bind(this);

		if(typeof this._audiosuspend == "function")
			arg.onsuspend = this._audiosuspend.bind(this);

		var tryInitAudio = function() {
			if(WGE.soundManagerReady)
			{
				if(self.audio)
					return;
				self.audio = soundManager.createSound(arg);
				self.audio.play();
				//��ʼʱ�����ֱ��Ϊ��ͣ״̬��������δ����״̬��
				if(!self._animationRequest)
					self.audio.pause();
			}
			else
			{
				setTimeout(tryInitAudio.bind(this), 100);
			}
		};

		tryInitAudio();
	},

	_audioFinish : function()
	{
		//Ĭ������ѭ������
		++this.audioPlayedTimes;
		this.audio.play();
	},

	_audioplaying : function()
	{
		this._audioplayingTime = this.getAudioPlayingTime();
	},

	_audiosuspend : function()
	{
		
	},

	getAudioPlayingTime : function()
	{
		return this.audioPlayedTimes * this.audio.duration + this.audio.position;
	},

	//�ͷ��ڴ棬���ƶ��豸��Ч���Ƚ����ԡ�
	release : function()
	{
		this.audio.destruct();
		this.srcImages = undefined;
		WGE.release(this);
	},

	play : function()
	{
		if(this._animationRequest || !this.timeline)
		{
			if(this._animationRequest)
				console.warn("�ظ����� slideshow �Ѿ����ڲ�����!");
			if(!this.timeline)
				console.error("ʱ���᲻���ڣ�");
			return ;
		}

		if(this.audio)
		{
			this.audio.play();
		}
		
		this._lastFrameTime = Date.now();
		this._loopFunc = this.mainloop.bind(this);
		this.timeline.start(0);
		this._animationRequest = requestAnimationFrame(this._loopFunc);
		this.audioPlayedTimes = 0;
		this._audioplayingTime = 0;
	},

	isPlaying : function()
	{
		return !!this._animationRequest;
	},

	stop : function()
	{
		if(this._animationRequest)
		{
			cancelAnimationFrame(this._animationRequest);
			this._animationRequest = null;
			this._end();
		}

		if(this.audio)
		{
			this.audio.stop();
		}
	},

	pause : function()
	{
		if(this._animationRequest)
		{
			cancelAnimationFrame(this._animationRequest);
			this._animationRequest = null;
		}

		if(this.audio)
		{
			this.audio.pause();
		}
	},

	resume : function()
	{
		if(!this._animationRequest && this.timeline && this.timeline.isStarted)
		{
			requestAnimationFrame(this._loopFunc);
			this._lastFrameTime = Date.now();

			if(this.audio)
			{
				this.audio.resume();
			}
		}
	},

	setVolume : function(v)
	{
		if(this.audio)
			this.audio.setVolume(v);
	},

	//������ת, �ݲ�ʵ��
	// jump : function(time)
	// {

	// },


	endloop : function()
	{
		if(this._animationRequest || !(this.context && this._endBlurCanvas && this._endCanvas))
			return;
		var time = Date.now();
		var dt = time - this._lastFrameTime;
		if(dt >  3000)
		{
			this.context.save();
			this.context.drawImage(this._endBlurCanvas, 0, 0);
			this.context.fillStyle = "#000";
			this.context.globalAlpha = 0.5;
			this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
			this.context.restore();
			console.log("Slideshow endloop finished.");
			return ;
		}

		this.context.save();

		if(dt < 1500)
		{
			this.context.drawImage(this._endCanvas, 0, 0);
			this.context.globalAlpha = dt / 1500;
			this.context.drawImage(this._endBlurCanvas, 0, 0);
		}
		else
		{
			this.context.drawImage(this._endBlurCanvas, 0, 0);
			this.context.globalAlpha = (dt - 1500) / 3000;
			this.context.fillStyle = "#000";
			this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		}
		this.context.restore();
		//��֤����ִ�м����(��������Ҫ̫�ߵ�֡�ʣ��ʹ�������)
		setTimeout(this.endloop.bind(this), 20);
	},

	_end : function()
	{
		console.log("Slideshow End");
		this._animationRequest = null;
		this._endBlurCanvas = WGE.CE("canvas");
		this._endBlurCanvas.width = this.canvas.width;
		this._endBlurCanvas.height = this.canvas.height;
		var ctx = this._endBlurCanvas.getContext('2d');
		var blurredData = WGE.Filter.StackBlur.stackBlurCanvasRGB(this.canvas, 0, 0, this.canvas.width, this.canvas.height, 50);
		ctx.putImageData(blurredData, 0, 0);
		this._endCanvas = WGE.CE("canvas");
		this._endCanvas.width = this.canvas.width;
		this._endCanvas.height = this.canvas.height;
		this._endCanvas.getContext('2d').drawImage(this.canvas, 0, 0);
		this.timeline.end();

		this._lastFrameTime = Date.now();
		this.endloop();

		if(this.audio)
		{
			this.audio.stop();
		}
	},

	// slideshow��ѭ��
	mainloop : function()
	{
		var timeNow = Date.now();
		var asyncTime = this._audioplayingTime - this.timeline.currentTime;

		//������ʱ����ʱ����ʱ����쳬��300����ʱ��ִ��ͬ������
		if(Math.abs(asyncTime) > 500)
		{
			console.log("ͬ��: ����ʱ��", this._audioplayingTime, "ʱ����ʱ��",this.timeline.currentTime, "��ֵ", asyncTime, "����500,����ͬ��");
			//��ʱ������������ʱ��ʱ��ִ��ʱ������Ծ��
			if(asyncTime > 500)
			{
				if(!this.timeline.update(asyncTime))
				{
					this._end();
					return ;
				}
				this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
				this.timeline.render(this.context);
			}
			else if(this.audio)
			{
				
				this.audio.resume();
				this._audioplayingTime = this.getAudioPlayingTime();
			}

			this._lastFrameTime = timeNow;			
			this._animationRequest = requestAnimationFrame(this._loopFunc);
			return ;
		}

		var deltaTime = timeNow - this._lastFrameTime;
		this._lastFrameTime = timeNow;

		if(!this.timeline.update(deltaTime))
		{
			this._end();
			return ;
		}

		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.timeline.render(this.context);
		this._animationRequest = requestAnimationFrame(this._loopFunc);
	}
	
});


WGE.SlideshowParsingEngine = 
{

	parse : function(config, slideshow)
	{
		if(!config)
			return null;
		if(config instanceof String)
		{
			config = JSON ? JSON.parse(config) : eval('(' + config + ')');
		}

		var parser;
		try
		{
			parser = this[config.parserName] || this.defaultParser;
		}catch(e) {
			parser = this.defaultParser;
		};
		return parser.call(this, config, slideshow);
	},

	_parseSceneDefault : function(scene, imgArr)
	{
		var spriteClass = WGE[scene.name] || WGE.SlideshowAnimationSprite;
		var sprite = new spriteClass(WGE.ClassInitWithArr, scene.initArgs);

		if(typeof scene.imageindex == "number")
		{
			var img = imgArr[scene.imageindex % imgArr.length];

			/////////////////////////////

			if(scene.spriteConfig.filter && img)
			{
				try
				{
					var filter = new WGE.Filter[scene.spriteConfig.filter](WGE.ClassInitWithArr, scene.spriteConfig.filterArgs);
					img = filter.bind(img).run();
				}catch(e) {
					console.error("when doing filter, defaultParser : ", e);
				}
			}

			var spriteInitFunc = sprite[scene.spriteConfig.name] || sprite.initSprite;
			spriteInitFunc.call(sprite, img, scene.spriteConfig.width, scene.spriteConfig.height);
		}

		/////////////////////////////

		var execFunc = scene.execFunc;
		for(var funcIndex in execFunc)
		{
			var funcConfig = execFunc[funcIndex];
			var func = sprite[funcConfig.name];
			if(func instanceof Function)
			{
				var arg = WGE.clone(funcConfig.arg);
				if(funcConfig.relativeResolution)
				{
					//��Էֱ��ʲ�����һ��0~1֮��ĸ�������
					if(arg[funcConfig.relativeWidth] && arg[funcConfig.relativeHeight])
					{
						arg[funcConfig.relativeWidth] *= WGE.SlideshowSettings.width;
						arg[funcConfig.relativeHeight] *= WGE.SlideshowSettings.height;
					}
				}
				func.apply(sprite, arg);
			}
		}

		/////////////////////////////

		var actions = scene.actions;
		for(var actionIndex in actions)
		{
			var actionConfig = actions[actionIndex];
			var actionClass = WGE.Actions[actionConfig.name];
			if(actionClass instanceof Function)
			{
				var action = new actionClass(WGE.ClassInitWithArr, actionConfig.arg);
				sprite.push(action);
			}				
		}

		////////////////////////////

		var childNodes = scene.childNodes;
		for(var childIndex in childNodes)
		{
			sprite.addChild(this._parseSceneDefault(childNodes[childIndex], imgArr));
		}
		return sprite;
	},

	// Ĭ�Ͻ�����
	defaultParser : function(config, slideshow)
	{
		if(!slideshow)
		{
			console.error("Invalid Params in WGE.SlideshowParsingEngine");
			return;
		}
		
		if(config.audioFileName)
		{
			slideshow.audioFileName = config.audioFileName;
			slideshow.musicDuration = parseFloat(config.musicDuration);
		}

		var totalTime = Math.ceil(slideshow.srcImages.length / config.loopImageNum) * config.loopTime;
		slideshow.timeline = new WGE.TimeLine(totalTime);

		var timeline = slideshow.timeline;
		var sceneArr = config.sceneArr;
		for(var sceneIndex in sceneArr)
		{
			timeline.push(this._parseSceneDefault(sceneArr[sceneIndex], slideshow.srcImages));
		}
	}
};


