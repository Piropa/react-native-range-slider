import * as tslib_1 from "tslib";
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, PanResponder, View, Text, TouchableHighlight, Platform, I18nManager, ViewPropTypes } from 'react-native';
var hairWidth = StyleSheet.hairlineWidth * 2;
export var masInfinito = "∞";
export var menosInfinito = "-∞";
var UNO = true, DOS = false, LIMITE = 2.5;
export var MarkerPropTypes = {
    enabled: PropTypes.bool,
    pressed: PropTypes.bool,
    //@ts-ignore
    markerStyle: ViewPropTypes.style,
    //@ts-ignore
    pressedMarkerStyle: ViewPropTypes.style,
    currentValue: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    valuePrefix: PropTypes.string,
    valueSuffix: PropTypes.string,
};
var MarkerClass = /** @class */ (function (_super) {
    tslib_1.__extends(MarkerClass, _super);
    function MarkerClass() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MarkerClass.prototype.render = function () {
        return (<TouchableHighlight>
        <View style={this.props.enabled
            ? [Markerstyles.markerStyle, this.props.markerStyle, this.props.pressed && Markerstyles.pressedMarkerStyle, this.props.pressed && this.props.pressedMarkerStyle]
            : [Markerstyles.markerStyle, Markerstyles.disabled]}/>
      </TouchableHighlight>);
    };
    MarkerClass.propTypes = MarkerPropTypes;
    return MarkerClass;
}(Component));
export { MarkerClass };
var rangoPropTypes = {
    rango: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    segmentos: PropTypes.number,
    pasos: PropTypes.number,
    dual: PropTypes.bool,
    valor1: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    valor2: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    etiquetas: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    solapar: PropTypes.bool,
    anchoEtiqueta: PropTypes.number,
    enabled: PropTypes.bool,
    onValuesChangeStart: PropTypes.func,
    onValuesChange: PropTypes.func,
    onValuesChangeFinish: PropTypes.func,
    touchDimensions: PropTypes.object,
    //@ts-ignore
    containerStyle: ViewPropTypes.style,
    //@ts-ignore
    trackStyle: ViewPropTypes.style,
    //@ts-ignore
    selectedStyle: ViewPropTypes.style,
    //@ts-ignore
    unselectedStyle: ViewPropTypes.style,
    //@ts-ignore
    markerContainerStyle: ViewPropTypes.style,
    //@ts-ignore
    markerStyle: ViewPropTypes.style,
    //@ts-ignore
    pressedMarkerStyle: ViewPropTypes.style,
    //@ts-ignore
    textStyle: ViewPropTypes.style,
    //@ts-ignore
    dividerStyle: ViewPropTypes.style,
    customMarker: PropTypes.func,
    customMarkerLeft: PropTypes.func,
    customMarkerRight: PropTypes.func,
    valuePrefix: PropTypes.string,
    valueSuffix: PropTypes.string,
    onToggle1: PropTypes.func,
    onToggle2: PropTypes.func,
    markerOffsetX: PropTypes.number,
    markerOffsetY: PropTypes.number,
};
var rangoDefault = {
    rango: { inicio: 0, fin: 100 },
    segmentos: 5,
    pasos: 0,
    etiquetas: "edges",
    solapar: false,
    dual: false,
    enabled: true,
    // Event Callbacks
    onValuesChangeStart: function () { },
    onValuesChange: function (values) { },
    onValuesChangeFinish: function (values) { },
    // Slider Boundaries
    touchDimensions: { height: 50, width: 50, borderRadius: 20, slipDisplacement: 100 },
    // Custom Marker
    customMarker: MarkerClass,
    // Other
    markerOffsetX: 0,
    markerOffsetY: 0,
};
//#endregion RANGESLIDER_TYPES
//#region RANGESLIDER
var RangeSlider = /** @class */ (function (_super) {
    tslib_1.__extends(RangeSlider, _super);
    function RangeSlider() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { minimo: 0 };
        return _this;
    }
    //#endregion Attributes
    //#region StaticFuncs
    RangeSlider.rangoCambia = function (props, state) {
        return !(props.pasos === state.pasos &&
            ((!Array.isArray(props.rango) &&
                !Array.isArray(state.rango) &&
                props.segmentos === state.segmentos &&
                props.rango.inicio === state.rango.inicio &&
                props.rango.fin === state.rango.fin) ||
                (Array.isArray(props.rango) &&
                    Array.isArray(state.rango) &&
                    props.rango.length === state.rango.length &&
                    JSON.stringify(props.rango) === JSON.stringify(state.rango))));
    };
    RangeSlider.obtItem = function (item, pasos) {
        if (typeof (item) === "number")
            return {
                valor: item,
                pasos: pasos
            };
        else if (item === "-∞" || item === "∞")
            return {
                valor: item,
                pasos: 1
            };
        if ((typeof (item) === "object") && !Array.isArray(item)) {
            if (typeof (item.valor) === "number")
                return {
                    valor: item.valor,
                    pasos: (typeof (item.pasos) === "number" && item.pasos >= 0.5) ? Math.round(item.pasos) : pasos
                };
            if (item.valor === "-∞" || item.valor === "∞")
                return {
                    valor: item.valor,
                    pasos: 1
                };
        }
        return undefined;
    };
    RangeSlider.isRangoArrayOk = function (rango, _pazoz) {
        var _rango = [], _pasos = [];
        var n = rango.length;
        if (n < 2)
            return undefined; // mìnimo de elementos en un array es 2
        var itemInicial = this.obtItem(rango[0], _pazoz);
        var itemFinal = this.obtItem(rango[n - 1], _pazoz);
        if (!itemInicial || !itemFinal)
            return undefined;
        var _inicio = itemInicial.valor;
        var _fin = itemFinal.valor;
        var _inicioInfinito = typeof (_inicio) !== "number" ? 1 : undefined;
        var _finalInfinito = typeof (_fin) !== "number" ? n - 2 : undefined;
        var x = 0;
        if (_inicioInfinito)
            x++;
        if (_finalInfinito)
            x++;
        if (x == 2)
            x++;
        if (n < 2 + x)
            return undefined; //minimo de elementos con un infinito es 3, con dos es 5
        if (_inicio === _fin)
            return undefined; // inicio y fin no pueden ser iguales
        var incremental = (_inicio === "-∞" || _fin === "∞") || !(_inicioInfinito || _finalInfinito || _inicio > _fin);
        _rango = [_inicio];
        _pasos = [typeof (_inicio) === "number" ? Math.round(Math.max(itemInicial.pasos, 0)) : 0];
        var lastValor = _inicio;
        var j = (typeof (_fin) === "number") ? n : n - 1;
        for (var i = 1; i < j; i++) {
            var item = this.obtItem(rango[i], _pazoz);
            if (!item ||
                (typeof (item.valor) !== "number") ||
                (incremental && (lastValor !== "-∞") && (lastValor > item.valor)) ||
                (!incremental && (lastValor !== "∞") && (lastValor < item.valor)))
                return undefined; // algùn elemento del array no es vàlido o tiene un valor contrasentido
            _rango.push(item.valor);
            _pasos.push(Math.round(Math.max(item.pasos, 0)));
            lastValor = item.valor;
        }
        var _segmentos = n - 1;
        if (_inicioInfinito)
            _segmentos--;
        if (_finalInfinito)
            _segmentos--;
        if (typeof (_fin) !== "number") {
            _rango.push(_fin);
            _pasos[j - 1] = 0;
            _pasos.push(0);
        }
        _pasos[n - 1] = 0;
        // if (_inicioInfinito) _pasos[1] -= 1
        // if (_finalInfinito) _pasos[j - 2] -= 1
        return { incremental: incremental, _inicio: _inicio, _fin: _fin, _rango: _rango, _pasos: _pasos, _segmentos: _segmentos, _inicioInfinito: _inicioInfinito, _finalInfinito: _finalInfinito }; //state calculado del array
    };
    RangeSlider.obtRango = function (rango, segmentos, _pazoz) {
        var _inicio, _fin;
        if (rango && !Array.isArray(rango) && typeof (rango) === "object" &&
            typeof (rango.inicio) === "number" &&
            typeof (rango.fin) === "number" &&
            rango.inicio !== rango.fin) {
            _inicio = rango.inicio;
            _fin = rango.fin;
        }
        else {
            _inicio = rangoDefault.rango.inicio;
            _fin = rangoDefault.rango.fin;
        }
        var _rango = [], _pasos = [];
        var _segmentos = (typeof (segmentos) === "number" && segmentos >= 0.5) ? Math.round(segmentos) : rangoDefault.segmentos;
        var delta = (_fin - _inicio) / _segmentos;
        var val = _inicio;
        for (var i = 0; i < _segmentos; i++) {
            _rango.push(val);
            _pasos.push(_pazoz);
            val += delta;
        }
        return { incremental: _inicio < _fin, _inicio: _inicio, _fin: _fin, _rango: _rango, _pasos: _pasos, _segmentos: _segmentos };
    };
    RangeSlider.pos2valor = function (state, pos, esUno) {
        var longitud = state.longitud, salto = state.salto, _segmentos = state._segmentos, _inicio = state._inicio, _fin = state._fin, _rango = state._rango, _pasos = state._pasos, _inicioInfinito = state._inicioInfinito, _finalInfinito = state._finalInfinito, solapar = state.solapar, r = Math.min(Math.max(0, pos), longitud) / salto, // identifica la posición relativa en número de segmentos
        a = Math.floor(r), // identifica el inicio del segmento
        base = a * salto, largo = salto, posicion = pos - base, aInf = !!_inicioInfinito && (a++ > -1) && (a === 1), // identifica si inicia con un infinito, a++, y es el primer segmento
        b = a + 1, // identifica el final del segmento
        bInf = !!_finalInfinito && (b >= _segmentos), // identifica si termina con un infinito
        pasosSegmento = ((aInf || bInf) && (_pasos[a] === 1)) ? 2 : _pasos[a], // si es infinito, el mínimo son 2 pasos, o 0 pasos (continuo).
        _limite = (pasosSegmento >= 1) ? (salto / pasosSegmento / 2) : LIMITE, // si hay pasos, el lìmite es medio paso, sino el default
        _2limite = _limite * 2, minimo = (esUno && !solapar) ? _2limite : (solapar ? 0 : undefined);
        if (pos === 0)
            return { pos: pos, valor: _inicio, minimo: minimo };
        else if (pos === longitud)
            return { pos: pos, valor: _fin, minimo: minimo };
        else if (aInf || bInf) {
            if (pos < _limite)
                return { pos: 0, valor: _inicio, minimo: minimo }; // si está a medio paso del infinito, infinito
            if (pos <= _2limite)
                return { pos: _2limite, valor: _rango[a], minimo: minimo }; // sino, el primer valor de inicio no infinito
            if (pos >= (longitud - _limite))
                return { pos: longitud, valor: _fin, minimo: minimo };
            if (pos >= (longitud - _2limite))
                return { pos: longitud - _2limite, valor: _rango[b], minimo: minimo };
            // si llegó acá, estamos en el primer segmento hay que determinar el valor y/o la posición precisa.
            if (pasosSegmento > 0)
                pasosSegmento--;
            largo = largo - _2limite;
            if (aInf) {
                base += _2limite;
                posicion -= _2limite;
            }
        }
        var ratio = pasosSegmento ? Math.round(posicion * pasosSegmento / largo) / pasosSegmento : posicion / largo, posX = pasosSegmento ? base + ratio * largo : pos, aV = _rango[a], // el valor en el inicio del segmento
        bV = _rango[b], // el valor en el final del segmento
        valor = aV + (bV - aV) * ratio;
        console.log(minimo, solapar);
        return { pos: posX, valor: valor, minimo: minimo };
    };
    RangeSlider.valor2pos = function (state, valor, esUno) {
        var longitud = state.longitud, salto = state.salto, _segmentos = state._segmentos, _inicio = state._inicio, _fin = state._fin, _rango = state._rango, _pasos = state._pasos, _inicioInfinito = state._inicioInfinito, _finalInfinito = state._finalInfinito, incremental = state.incremental, solapar = state.solapar, factor = incremental ? 1 : -1, primero = _inicioInfinito ? 1 : 0, ultimo = primero + _segmentos, aV = _rango[primero], bV = _rango[ultimo], a = 0, i = primero, resp;
        if (valor === _inicio)
            resp = { pos: 0, valor: valor };
        else if (valor === _fin)
            resp = { pos: longitud, valor: valor };
        else if (typeof (valor) !== "number")
            resp = { pos: 0, valor: _inicio };
        else if (factor * (aV - valor) > 0)
            resp = { pos: 0, valor: _inicio };
        else if (factor * (bV - valor) < 0)
            resp = { pos: longitud, valor: _fin };
        else
            for (; i < ultimo; i++) {
                aV = _rango[i];
                bV = _rango[i + 1];
                if ((incremental && (aV <= valor) && (valor < bV)) || (!incremental && (aV >= valor) && (valor > bV))) {
                    a = i;
                    break;
                }
                a = i;
            }
        if (esUno && resp && resp.pos === 0 && _inicioInfinito) {
            a = _inicioInfinito;
            aV = _rango[a];
            bV = _rango[a + 1];
        }
        var b = a + 1, aInf = (a === _inicioInfinito), bInf = (b === _finalInfinito), pasosSegmento = ((aInf || bInf) && (_pasos[a] === 1)) ? 2 : _pasos[a], _limite = (pasosSegmento >= 1) ? (salto / pasosSegmento / 2) : LIMITE, _2limite = _limite * 2, minimo = (esUno && !solapar) ? _2limite : (solapar ? 0 : undefined), base = aInf ? _2limite : ((a - primero) * salto), largo = salto - ((aInf || bInf) ? _2limite : 0), ratio = pasosSegmento ? Math.round((valor - aV) / (bV - aV) * pasosSegmento) / pasosSegmento : (valor - aV) / (bV - aV), pos = base + ratio * largo, valorX = aV + ratio * (bV - aV);
        console.log(minimo, solapar);
        return resp ? tslib_1.__assign({}, resp, { minimo: minimo }) : { pos: pos, valor: valorX, minimo: minimo };
    };
    RangeSlider.getDerivedStateFromProps = function (nextProps, state) {
        var presionado1 = state.presionado1, presionado2 = state.presionado2;
        if (presionado1 || presionado2)
            return null;
        var newRango = undefined, _a = nextProps, rango = _a.rango, pasos = _a.pasos, segmentos = _a.segmentos, solapar = _a.solapar, newState = !!state ? undefined : { rango: rango, pasos: pasos, segmentos: segmentos }, _pazoz = (typeof (pasos) === "number" && pasos >= 0.5) ? Math.round(pasos) : rangoDefault.pasos;
        //console.log(solapar)
        if (!state || RangeSlider.rangoCambia(nextProps, state)) {
            if (!(rango && Array.isArray(rango) && (newRango = RangeSlider.isRangoArrayOk(rango, _pazoz))))
                newRango = RangeSlider.obtRango(rango, segmentos, _pazoz);
        }
        var longitud = state.longitud, longitudPrev = state.longitudPrev, dualPrev = state.dual, dual = nextProps.dual, valores = undefined;
        if (longitud && ((longitud !== longitudPrev) || newRango || (dual !== dualPrev))) {
            var _b = newRango || state, _segmentos = _b._segmentos, _inicio = _b._inicio, _fin = _b._fin, _rango = _b._rango, _pasos = _b._pasos, _inicioInfinito = _b._inicioInfinito, _finalInfinito = _b._finalInfinito, incremental = _b.incremental, valor1prev = state.valor1, valor2prev = state.valor2, salto = longitud / _segmentos, tempState = { longitud: longitud, salto: salto, _segmentos: _segmentos, _inicio: _inicio, _fin: _fin, _rango: _rango, _pasos: _pasos, _inicioInfinito: _inicioInfinito, _finalInfinito: _finalInfinito, incremental: incremental }, x = void 0, uno = {
                valor1: (x = RangeSlider.valor2pos(tempState, ((typeof (valor1prev) !== 'undefined') ? valor1prev : ((typeof (nextProps.valor1) !== 'undefined') ? nextProps.valor1 : _inicio)), true)).valor,
                pos1: x.pos,
                posPrev1: x.pos,
                presionado1: false
            }, minimo = solapar ? 0 : x.minimo, dos = dual ? {
                valor2: (x = RangeSlider.valor2pos(tempState, ((typeof (valor2prev) !== 'undefined') ? valor2prev : ((typeof (nextProps.valor2) !== 'undefined') ? nextProps.valor2 : _fin)), false)).valor,
                pos2: x.pos,
                posPrev2: x.pos,
                presionado2: false
            } : undefined;
            valores = tslib_1.__assign({ longitud: longitud, longitudPrev: longitud, salto: salto, dual: dual }, uno, dos, { minimo: minimo, solapar: solapar });
        }
        console.log(tslib_1.__assign({}, newState, newRango, valores));
        //console.log(state)
        //@ts-ignore
        if (newState || newRango || valores)
            return tslib_1.__assign({}, newState, newRango, valores);
        return null;
    };
    //#endregion StaticFuncs
    RangeSlider.prototype.componentDidMount = function () {
        var _this = this;
        var customPanResponder = function (start, move, end) {
            return PanResponder.create({
                onStartShouldSetPanResponder: function (evt, gestureState) { return true; },
                onStartShouldSetPanResponderCapture: function (evt, gestureState) { return true; },
                onMoveShouldSetPanResponder: function (evt, gestureState) { return true; },
                onMoveShouldSetPanResponderCapture: function (evt, gestureState) { return true; },
                onPanResponderGrant: function (evt, gestureState) { return start(); },
                onPanResponderMove: function (evt, gestureState) { return move(gestureState); },
                onPanResponderTerminationRequest: function (evt, gestureState) { return false; },
                onPanResponderRelease: function (evt, gestureState) { return end(); },
                onPanResponderTerminate: function (evt, gestureState) { return end(); },
                onShouldBlockNativeResponder: function (evt, gestureState) { return true; },
            });
        };
        this._panResponderOne = customPanResponder(function () { return _this.iniciaMov(UNO); }, function (mov) { return _this.mueve(UNO, mov); }, function () { return _this.finMov(UNO); });
        this._panResponderTwo = customPanResponder(function () { return _this.iniciaMov(DOS); }, function (mov) { return _this.mueve(DOS, mov); }, function () { return _this.finMov(DOS); });
    };
    RangeSlider.prototype.iniciaMov = function (esUno) {
        if (this.props.enabled) {
            this.props.onValuesChangeStart();
            this.setState(esUno ? { presionado1: true } : { presionado2: true });
        }
    };
    RangeSlider.prototype.finMov = function (esUno) {
        var _this = this;
        this.setState(esUno ? { posPrev1: this.state.pos1, presionado1: false } : { posPrev2: this.state.pos2, presionado2: false }, function () { return _this.props.onValuesChangeFinish(_this.state.valor1, _this.state.valor2); });
    };
    RangeSlider.prototype.mueve = function (esUno, _a) {
        var _this = this;
        var dx = _a.dx, dy = _a.dy;
        var _b = this.props, enabled = _b.enabled, touchDimensions = _b.touchDimensions, onValuesChange = _b.onValuesChange;
        if (!enabled)
            return;
        var _c = this.state, longitud = _c.longitud, pos1 = _c.pos1, pos2 = _c.pos2, posPrev1 = _c.posPrev1, posPrev2 = _c.posPrev2, valor1 = _c.valor1, valor2 = _c.valor2, dual = _c.dual, minimo = _c.minimo;
        var posPrev, valor;
        if (esUno) {
            posPrev = posPrev1;
            valor = valor1;
        }
        else {
            posPrev = posPrev2;
            valor = valor2;
        }
        var nuevaPos = I18nManager.isRTL ? (posPrev - dx) : (posPrev + dx);
        var bottom = esUno ? 0 : pos1 + minimo;
        var top = (esUno && dual) ? pos2 - minimo : longitud;
        nuevaPos = (nuevaPos < bottom) ? bottom : (nuevaPos > top) ? top : nuevaPos;
        if (Math.abs(dy) < touchDimensions.slipDisplacement || !touchDimensions.slipDisplacement) {
            var estado = RangeSlider.pos2valor(this.state, nuevaPos, esUno);
            this.setState(esUno ? { pos1: estado.pos, minimo: estado.minimo } : { pos2: estado.pos });
            if (valor !== estado.valor)
                this.setState(esUno ? { valor1: estado.valor } : { valor2: estado.valor }, function () { if (onValuesChange)
                    onValuesChange(_this.state.valor1, dual ? _this.state.valor2 : undefined); });
        }
    };
    RangeSlider.prototype.ponLongitud = function (longitud) {
        var _this = this;
        if (longitud !== this.state.longitud)
            this.setState({ longitud: longitud }, function () { return _this.setState(RangeSlider.getDerivedStateFromProps(_this.props, _this.state)); });
    };
    RangeSlider.prototype.render = function () {
        var _this = this;
        var _a = this.state, pos1 = _a.pos1, pos2 = _a.pos2, longitud = _a.longitud, dual = _a.dual, presionado1 = _a.presionado1, presionado2 = _a.presionado2, valor1 = _a.valor1, valor2 = _a.valor2, salto = _a.salto, _rango = _a._rango, _pasos = _a._pasos, _segmentos = _a._segmentos, _inicioInfinito = _a._inicioInfinito, _finalInfinito = _a._finalInfinito, _b = this.props, selectedStyle = _b.selectedStyle, unselectedStyle = _b.unselectedStyle, textStyle = _b.textStyle, dividerStyle = _b.dividerStyle, trackStyle = _b.trackStyle, containerStyle = _b.containerStyle, markerContainerStyle = _b.markerContainerStyle, markerStyle = _b.markerStyle, pressedMarkerStyle = _b.pressedMarkerStyle, touchDimensions = _b.touchDimensions, customMarker = _b.customMarker, markerOffsetX = _b.markerOffsetX, markerOffsetY = _b.markerOffsetY, valuePrefix = _b.valuePrefix, valueSuffix = _b.valueSuffix, etiquetas = _b.etiquetas, enabled = _b.enabled, trackThreeLength = dual ? longitud - pos2 : 0, trackOneLength = pos1, trackTwoLength = longitud - trackOneLength - trackThreeLength, trackOneStyle = dual ? [unselectedStyle] : [RangeStyles.selectedTrack, selectedStyle], trackTwoStyle = dual ? [RangeStyles.selectedTrack, selectedStyle] : [unselectedStyle], trackThreeStyle = unselectedStyle, MarkerLeft = this.props.customMarkerLeft || customMarker, MarkerRight = this.props.customMarkerRight || customMarker, _c = touchDimensions, height = _c.height, width = _c.width, borderRadius = _c.borderRadius, touchStyle = { borderRadius: borderRadius, height: height, width: width }, markerContainerOne = { top: markerOffsetY - 24, left: trackOneLength + markerOffsetX - 24 }, markerContainerTwo = { top: markerOffsetY - 24, right: trackThreeLength + markerOffsetX - 24 }, margin = (width || 0) / 2 + 5, marginV = (height || 0) / 2 + 5;
        return (<View style={[RangeStyles.container, containerStyle]} onLayout={function (_a) {
            var width = _a.nativeEvent.layout.width;
            return _this.ponLongitud(width - margin * 2);
        }}>
        {longitud &&
            <Ruler {...{ etiquetas: etiquetas, longitud: longitud, _rango: _rango, _segmentos: _segmentos, _inicioInfinito: _inicioInfinito, _finalInfinito: _finalInfinito }} style={{ marginHorizontal: margin }} textStyle={textStyle} dividerStyle={dividerStyle}/>}
        {longitud &&
            <View style={[RangeStyles.fullTrack, { width: longitud, margin: margin, marginTop: etiquetas ? 0 : marginV }]}>
            <View style={[RangeStyles.track, trackStyle].concat(trackOneStyle, [{ width: trackOneLength }])}/>
            <View style={[RangeStyles.track, trackStyle].concat(trackTwoStyle, [{ width: trackTwoLength }])}/>
           {dual &&
                <View style={[RangeStyles.track, trackStyle, trackThreeStyle, { width: trackThreeLength }]}/>}
            <View style={[RangeStyles.markerContainer, markerContainerOne, markerContainerStyle, (pos1 > (longitud / 2)) && RangeStyles.topMarkerContainer]}>
              <View style={[RangeStyles.touch, touchStyle]} {...this._panResponderOne.panHandlers}>
                <MarkerLeft {...{ enabled: enabled, markerStyle: markerStyle, pressedMarkerStyle: pressedMarkerStyle, valuePrefix: valuePrefix, valueSuffix: valueSuffix }} pressed={presionado1} currentValue={valor1}/>
              </View>
            </View>
           {dual && pos1 !== longitud &&
                <View style={[RangeStyles.markerContainer, markerContainerTwo, markerContainerStyle]}>
              <View style={[RangeStyles.touch, touchStyle]} {...this._panResponderTwo.panHandlers}>
                <MarkerRight {...{ enabled: enabled, markerStyle: markerStyle, pressedMarkerStyle: pressedMarkerStyle, valuePrefix: valuePrefix, valueSuffix: valueSuffix }} pressed={presionado2} currentValue={valor2}/>
              </View>
            </View>}
          </View>}
      </View>);
    };
    //#region Attributes
    RangeSlider.propTypes = rangoPropTypes;
    RangeSlider.defaultProps = rangoDefault;
    return RangeSlider;
}(Component));
export default RangeSlider;
var Ruler = /** @class */ (function (_super) {
    tslib_1.__extends(Ruler, _super);
    function Ruler() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Ruler.prototype.shouldComponentUpdate = function (nextProps) {
        return (this.props.etiquetas !== nextProps.etiquetas ||
            this.props.longitud !== nextProps.longitud);
    };
    Ruler.prototype.render = function () {
        var _a = this.props, etiquetas = _a.etiquetas, longitud = _a.longitud, _segmentos = _a._segmentos, style = _a.style, _rango = _a._rango, _inicioInfinito = _a._inicioInfinito, _finalInfinito = _a._finalInfinito, dividerStyle = _a.dividerStyle, textStyle = _a.textStyle, espacio = (longitud - hairWidth) / _segmentos - hairWidth;
        if (!etiquetas)
            return null;
        return (<View style={[style, RulerStyles.container]}>
        {(etiquetas === "edges") ? (<View style={RulerStyles.innerContainer}>
              <View key="a" style={RulerStyles.textContainer}>
                <Text style={[RulerStyles.text, textStyle, RulerStyles.textBox]}>
                  {_rango[0]}
                </Text>
              </View>
              <View key="s" style={{ width: longitud - hairWidth * 2 }}/>
              <View key="b" style={RulerStyles.textContainer}>
                <Text style={[RulerStyles.text, textStyle, RulerStyles.textBox]}>
                  {_rango[_rango.length - 1]}
                </Text>
              </View>
            </View>) : (<View style={RulerStyles.innerContainer}>
              {_rango.map(function (valor, index) {
            return (index === _inicioInfinito || index == _finalInfinito) ? null : (<View key={index.toString()} style={RulerStyles.innerContainer}>
                    {!!index && <View style={{ width: espacio }}/>}
                    <View style={RulerStyles.textContainer}>
                      <Text style={[RulerStyles.text, textStyle, RulerStyles.textBox]}>
                        {valor /* .toString() : valor */}
                      </Text>
                    </View>
                </View>);
        })}
            </View>)}
        <View style={RulerStyles.markerContainer}>
          {_rango.map(function (_, index) {
            return (index === _inicioInfinito || index === _finalInfinito) ? null : (<View key={index.toString()} style={RulerStyles.innerContainer}>
                {!!index && <View style={{ width: espacio }}/>}
                <View style={[RulerStyles.divider, dividerStyle, { width: hairWidth }]}/>
              </View>);
        })}
        </View>
      </View>);
    };
    return Ruler;
}(Component));
export { Ruler };
//#endregion RULER
//#region STYLES
var markColor = 'darkgray';
var textColor = 'darkgray';
var RangeStyles = StyleSheet.create({
    container: { position: 'relative' },
    fullTrack: { flexDirection: 'row' },
    track: { height: StyleSheet.hairlineWidth * 5, borderRadius: StyleSheet.hairlineWidth * 2.5, backgroundColor: markColor },
    selectedTrack: { backgroundColor: 'purple' },
    markerContainer: { position: 'absolute', width: 50, height: 50, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' },
    topMarkerContainer: { zIndex: 1 },
    touch: { backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center', alignSelf: 'stretch' },
});
var Markerstyles = StyleSheet.create({
    markerStyle: tslib_1.__assign({ height: 30, width: 30, borderRadius: 15, borderWidth: StyleSheet.hairlineWidth * 2, borderColor: '#DDDDDD', backgroundColor: '#FFFFFF' }, Platform.select({
        ios: { shadowColor: '#000000', shadowOffset: { width: 0, height: StyleSheet.hairlineWidth * 3 }, shadowRadius: 1, shadowOpacity: 0.2 },
        android: { margin: StyleSheet.hairlineWidth * 10, elevation: StyleSheet.hairlineWidth * 5 },
    })),
    pressedMarkerStyle: {},
    disabled: { backgroundColor: '#d3d3d3' },
});
var RulerStyles = StyleSheet.create({
    container: { flexDirection: 'column' },
    innerContainer: { flex: 0, flexDirection: 'row' },
    markerContainer: { flex: 0, flexDirection: 'row' },
    textContainer: { flex: 0, alignItems: 'center', alignContent: 'center', width: hairWidth, overflow: 'visible' },
    divider: { height: 10, marginTop: 3, marginBottom: 7, backgroundColor: markColor },
    text: { fontSize: 16, color: textColor },
    textBox: { textAlign: 'center', width: 40 }
});
//#endregion STYLES
//#region CONVERTER
/*
  function closest(array: number[], n: number): number {
    let minI = 0
    let maxI = array.length - 1
    if ((array[minI] > n)) {
      return minI
    } else if (array[maxI] < n) {
      return maxI
    } else if (array[minI] <= n && n <= array[maxI]) {
      let closestIndex: number | null = null
      while (closestIndex === null) {
        const midI = Math.round((minI + maxI) / 2)
        const midVal = array[midI]
        if (midVal === n) {
          closestIndex = midI
        } else if (maxI === minI + 1) {
          const minValue = array[minI]
          const maxValue = array[maxI]
          const deltaMin = Math.abs(minValue - n)
          const deltaMax = Math.abs(maxValue - n)
          closestIndex = deltaMax <= deltaMin ? maxI : minI
        } else if (midVal < n) {
          minI = midI
        } else if (midVal > n) {
          maxI = midI
        } else {
          closestIndex = -1
        }
      }
      return closestIndex
    }
    return -1
  }
  function valueToPosition(value: number, valuesArray: number[], sliderLength: number): number {
    let index = closest(valuesArray, value)
    let arrLength = valuesArray.length - 1
    let validIndex = index === -1 ? arrLength : index
    return sliderLength * validIndex / arrLength
  }
  function positionToValue(position: number, valuesArray: number[], sliderLength: number): number | null {
    let arrLength: number, index: number
    if (position < 0 || sliderLength < position) {
      return null
    } else {
      arrLength = valuesArray.length - 1
      index = arrLength * position / sliderLength
      return valuesArray[Math.round(index)]
    }
  }
  function createArray(start: number, end: number, step: number): number[] {
    let i: number, length: number
    let direction = start - end > 0 ? -1 : 1
    let result: number[] = []
    if (!step) return result
    else {
      length = Math.abs((start - end) / step) + 1
      for (i = 0; i < length; i++) {
        result.push(start + i * Math.abs(step) * direction)
      }
      return result
    }
  }
  function configLabels(config: configArrayType, options: optionsArrayType, min: number, max: number, step: number): configType {
    let optionsArray: optionsArrayType,
        labelsArray: labelsArrayType | undefined = undefined,
        viewsArray: viewsArrayType | undefined = undefined,
        valuesArray: valuesArrayType | undefined = undefined
    if (config && config.length > 2) {
      let label: string, lastValue: number, delta: number
      let //ca = configArray,
          i = 0,
          n = 0,
          j = 0,
          length = config.length - 1,
          value = config[0][0],
          steps = config[0][1]
      if (steps <= 0) {
        label = ((steps == 0)||(steps == -2)) ? "∞" : "-∞"
        if (steps > -2) {
          labelsArray = [ label ]
          viewsArray = [ 0 ]
        } else {
          labelsArray = []
          viewsArray = []
        }
      } else {
        label = value.toString()
        labelsArray = [ label ]
        viewsArray = [1]
      }
      optionsArray = [ 0 ]
      valuesArray = [ (steps <= 0) ? label : value ]
      do {
        i++
        lastValue = value
        value = config[i][0]
        steps = config[i][1]
        if (steps < 1 && i < length) steps = 1
        if (steps > 0) {
          delta = (value - lastValue)/steps
          for (j=0; j < steps; j++) {
            n++
            lastValue += delta
            // label = lastValue.toString()
            optionsArray.push(n)
            valuesArray.push(lastValue)
          }
          label = value.toString()
          labelsArray.push(label)
          viewsArray.push(steps)
        } else {
          label = ((steps == 0)||(steps == -2)) ? "∞" : "-∞"
          valuesArray[n] = label
          labelsArray[ i - 1 ] = (steps > -2) ? label : ""
        }
      } while (i < length)
    } else
      optionsArray = options || createArray(min!, max!, step!)
    return { optionsArray, labelsArray, viewsArray, valuesArray }
  }
*/
//#endregion CONVERTER
//# sourceMappingURL=RangeSlider.js.map