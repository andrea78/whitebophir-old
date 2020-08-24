/**
 *                        WHITEBOPHIR
 *********************************************************
 * @licstart  The following is the entire license notice for the 
 *  JavaScript code in this page.
 *
 * Copyright (C) 2013  Ophir LOJKINE
 *
 *
 * The JavaScript code in this page is free software: you can
 * redistribute it and/or modify it under the terms of the GNU
 * General Public License (GNU GPL) as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option)
 * any later version.  The code is distributed WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
 *
 * As additional permission under GNU GPL version 3 section 7, you
 * may distribute non-source (e.g., minimized or compacted) forms of
 * that code without the copy of the GNU GPL normally required by
 * section 4, provided you include this license notice and a URL
 * through which recipients can access the Corresponding Source.
 *
 * @licend
 */

(function () { //Code isolation
    console.log('new');
    var ZOOM_FACTOR = .01;
    var ctrl_pressed = false;
    var origin = {
        scrollX: document.documentElement.scrollLeft,
        scrollY: document.documentElement.scrollTop,
        x: 0.0,
        y: 0.0,
        clientY: 0,
        scale: 1.0
    };
    var pressed = false;
    var animation = null;
    const body = document;
    body.addEventListener("touchend", touchend);
    body.addEventListener("touchcancel", touchend);
    body.addEventListener("wheel", onwheel, { passive: false });
    body.addEventListener("keydown", onKeyDown);
    body.addEventListener("keyup", onKeyUp);

    function zoom(origin, scale) {
        var oldScale = origin.scale;
        var newScale = Tools.setScale(scale);
        window.scrollTo(
            origin.scrollX + origin.x * (newScale - oldScale),
            origin.scrollY + origin.y * (newScale - oldScale)
        );
        resizeBoard();
    }

    function animate(scale) {
        cancelAnimationFrame(animation);
        animation = requestAnimationFrame(function () {
            zoom(origin, scale);
        });
    }

    function setOrigin(x, y, evt, isTouchEvent) {
        origin.scrollX = document.documentElement.scrollLeft;
        origin.scrollY = document.documentElement.scrollTop;
        origin.x = x;
        origin.y = y;
        origin.clientY = getClientY(evt, isTouchEvent);
        origin.scale = Tools.getScale();
    }

    function onKeyDown(evt) {
        if (evt.ctrlKey) {
            ctrl_pressed = true;
            evt.preventDefault();
            if (evt.key === '=') {
                Tools.setScale(1);
                resizeBoard();
            } else if (evt.key === '+') {
                Tools.setScale(Tools.getScale() + 0.1);
                resizeBoard();
            } else if (evt.key === '-') {
                Tools.setScale(Tools.getScale() - 0.1);
                resizeBoard();
            } else if (evt.key === '/') {
                Tools.setScale(document.body.clientWidth / Tools.server_config.MAX_BOARD_SIZE_X);
                resizeBoard();
            }
        }
    }

    function onKeyUp(evt) {
        if (evt.ctrlKey) ctrl_pressed = false;
    }

    function onwheel(evt) {
        evt.preventDefault();
        if (evt.ctrlKey && ctrl_pressed) {
            var scale = Tools.getScale();
            var x = evt.pageX / scale;
            var y = evt.pageY / scale;
            setOrigin(x, y, evt, false);
            animate(Tools.getScale() - (((evt.deltaY > 0) - (evt.deltaY < 0))) * 0.2);
        } else if (evt.ctrlKey && !ctrl_pressed) {
            var scale = Tools.getScale();
            var x = evt.pageX / scale;
            var y = evt.pageY / scale;
            setOrigin(x, y, evt, false);
            if (Tools.getScale() < 1) {
                if (document.body.clientWidth / Tools.server_config.MAX_BOARD_SIZE_X > Tools.getScale()) {
                    animate(Tools.getScale() - (((evt.deltaY > 0) - (evt.deltaY < 0))) * 0.001);
                } else {
                    animate(Tools.getScale() - (((evt.deltaY > 0) - (evt.deltaY < 0))) * 0.01);
                }

            } else {
                animate(Tools.getScale() - (((evt.deltaY > 0) - (evt.deltaY < 0))) * 0.02);
            }
        } else {
            window.scrollTo(document.documentElement.scrollLeft + evt.deltaX, document.documentElement.scrollTop + evt.deltaY);
        }
    }

    Tools.board.addEventListener("touchmove", function ontouchmove(evt) {
        // 2-finger pan to zoom
        var touches = evt.touches;
        if (touches.length === 2) {
            var x0 = touches[0].clientX, x1 = touches[1].clientX,
                y0 = touches[0].clientY, y1 = touches[1].clientY,
                dx = x0 - x1,
                dy = y0 - y1;
            var x = (touches[0].pageX + touches[1].pageX) / 2 / Tools.getScale(),
                y = (touches[0].pageY + touches[1].pageY) / 2 / Tools.getScale();
            var distance = Math.sqrt(dx * dx + dy * dy);
            if (!pressed) {
                pressed = true;
                setOrigin(x, y, evt, true);
                origin.distance = distance;
            } else {
                var delta = distance - origin.distance;
                var scale = origin.scale * (1 + delta * ZOOM_FACTOR / 100);
                animate(scale);
            }
        }
    }, { passive: true });

    function touchend() {
        pressed = false;
    }

    function getClientY(evt, isTouchEvent) {
        return isTouchEvent ? evt.changedTouches[0].clientY : evt.clientY;
    }

    Tools.register({"name": "Zoom"});
})(); //End of code isolation
