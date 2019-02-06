import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, PanResponder, View, Text, TouchableHighlight, Platform, I18nManager, ViewPropTypes, ViewStyle, TextStyle, PanResponderGestureState, PanResponderInstance } from 'react-native'

const hairWidth = StyleSheet.hairlineWidth * 2
export const masInfinito = "∞"
export const menosInfinito = "-∞"
export type tipoValor = number | "∞" | "-∞"
const UNO = true, DOS = false, LIMITE = 2.5

//#region MARKER
export interface MarkerProps {
  enabled?: boolean
  pressed?: boolean
  markerStyle?: ViewStyle
  pressedMarkerStyle?: ViewStyle
  currentValue?: tipoValor
  valuePrefix?: string
  valueSuffix?: string
}
export const MarkerPropTypes = {
  enabled: PropTypes.bool,
  pressed: PropTypes.bool,
  //@ts-ignore
  markerStyle: ViewPropTypes.style,
  //@ts-ignore
  pressedMarkerStyle: ViewPropTypes.style,
  currentValue: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  valuePrefix: PropTypes.string,
  valueSuffix: PropTypes.string,
}
export class MarkerClass extends Component<MarkerProps> {
  static propTypes = MarkerPropTypes
  render() {
    return (
      <TouchableHighlight>
        <View style = {this.props.enabled
          ? [ Markerstyles.markerStyle, this.props.markerStyle, this.props.pressed && Markerstyles.pressedMarkerStyle, this.props.pressed && this.props.pressedMarkerStyle ]
          : [Markerstyles.markerStyle, Markerstyles.disabled]
        } />
      </TouchableHighlight>
    )
  }
}
export type MarkerClassType = typeof MarkerClass
//#endregion MARKER

//#region RANGESLIDER_TYPES
type funcType = () => void
type funcValuesType = (val1: tipoValor, val2?: tipoValor) => void
type funcGest = (values: PanResponderGestureState) => void
interface tipoRango {
  inicio: number
  fin: number
}
type objValor = { 
  valor: tipoValor,
  pasos?: number // undefined ó > 0, default = 1 || <<.pasos
}
type rangoValor = tipoValor | objValor
type rangoSimple = {
  rango?: tipoRango
  segmentos?: number // número de divisones: entero > 0, default = 5
}
type rangoArray = {
  rango?: rangoValor[] // mínimo 2 elementos + número de infinitoa (0, 1, 2), si error, default TIPO 1
}
type props2stateRango = ( rangoSimple | rangoArray ) & {
  pasos?: number // número de pasos en cada segmento: entero > 0, default = 5, 0 = continuo
  dual?: boolean // uno o dos valores
  valor1?: tipoValor // valor 1 inicial, default = inicio
  valor2?: tipoValor // valor 2 inicial, default = final
  solapar?:boolean
}
type propsRango = props2stateRango & {
  etiquetas?: boolean | "edges" // si= extremos y pasos, extremos e hitos, no = sin etiquetas, "edges" = sólo extremos
  anchoEtiqueta?: number // default = 50
  // Event Callbacks
  enabled?: boolean,
  onValuesChangeStart?: funcType        // Function to be called at beginning of press
  onValuesChange?: funcValuesType        // Function called after every change in value, with current values passed in as an array.
  onValuesChangeFinish?: funcValuesType  // Function called on end of press with final values passed in as an array
  // Slider Boundaries
  touchDimensions?: {height?: number, width?: number, borderRadius?: number, slipDisplacement?: number}  // Area to be touched, should enclose the whole marker.
                                        // Will be automatically centered and contain the marker. Slip displacement If finger leaves the marker measures distance before
                                        // responder cuts out and changes are no longer registered, if not given marker will be active until pressed released.
  //sliderOrientation?: 'horizontal' | 'vertical'  // horizontal or vertical	(TODO)
  // Custom Styles
  containerStyle?: ViewStyle            // Style of sliders container, note be careful in applying styles that may affect the children's
                                        // (i.e. the slider's) positioning
  trackStyle?: ViewStyle                // Customise the track
  selectedStyle?: ViewStyle             // Style for the track up to a single marker or between double markers
  unselectedStyle?: ViewStyle           // Style for remaining track
  markerContainerStyle?: ViewStyle
  markerStyle?: ViewStyle               // Customise the marker's style
  pressedMarkerStyle?: ViewStyle        // Style to be given to marker when pressed
  textStyle?: TextStyle
  dividerStyle?: ViewStyle
  // Custom Marker
  customMarker?: MarkerClassType
  customMarkerLeft?: MarkerClassType
  customMarkerRight?: MarkerClassType
  // Other
  valuePrefix?: string
  valueSuffix?: string
  markerOffsetX?: number
  markerOffsetY?: number
}
const rangoPropTypes = {
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
}
const rangoDefault: propsRango = {
  rango: { inicio: 0, fin: 100 },
  segmentos: 5,
  pasos: 0, // 0 = contínuo,
  etiquetas: "edges",
  solapar: false,
  dual: false,
  enabled: true,
  // Event Callbacks
  onValuesChangeStart: () => {},
  onValuesChange: values => {},
  onValuesChangeFinish: values => {},
  // Slider Boundaries
  touchDimensions: { height: 50, width: 50, borderRadius: 20, slipDisplacement: 100 },
  // Custom Marker
  customMarker: MarkerClass,
  // Other
  markerOffsetX: 0,
  markerOffsetY: 0,
}
type stateRango = props2stateRango & {
  pos1?: number
  pos2?: number
  posPrev1?: number
  posPrev2?: number
  presionado1?: boolean
  presionado2?: boolean
  longitud?: number
  longitudPrev?: number
  salto?: number
  minimo?: number
  incremental?: boolean // incrementa = inicio < fin
  _inicio?: tipoValor
  _fin?: tipoValor
  _rango?: tipoValor[]
  _pasos?: number[]
  _segmentos?: number
  _inicioInfinito?: number
  _finalInfinito?: number
}
//#endregion RANGESLIDER_TYPES
//#region RANGESLIDER
export default class RangeSlider extends Component<propsRango, stateRango> {
  //#region Attributes
  static propTypes = rangoPropTypes
  static defaultProps = rangoDefault
  _panResponderOne?: PanResponderInstance
  _panResponderTwo?: PanResponderInstance
  state: stateRango = { minimo: 0 }
  //#endregion Attributes
  //#region StaticFuncs
  static rangoCambia(props: propsRango, state: stateRango) : boolean {
    return !(props.pasos === state.pasos &&
     ((!Array.isArray(props.rango) &&
        !Array.isArray(state.rango) &&
        (props as rangoSimple).segmentos! === (state as rangoSimple).segmentos! &&
        (props as rangoSimple).rango!.inicio === (state as rangoSimple).rango!.inicio &&
        (props as rangoSimple).rango!.fin === (state as rangoSimple).rango!.fin ) ||
      ( Array.isArray(props.rango) &&
        Array.isArray(state.rango) &&
        props.rango.length === state.rango.length &&
        JSON.stringify(props.rango) === JSON.stringify(state.rango)
    )))
  }
  static obtItem(item: rangoValor, pasos: number): objValor | undefined { // undefined en caso de error
    if (typeof(item) === "number") return {
      valor: item,
      pasos
    }
    else if (item === "-∞" || item === "∞") return {
      valor: item,
      pasos: 1
    }
    if ((typeof(item) === "object") && !Array.isArray(item)) {
      if (typeof(item.valor) === "number") return {
        valor: item.valor,
        pasos: (typeof(item.pasos) === "number" && item.pasos >= 0.5) ? Math.round(item.pasos) : pasos
      } 
      if (item.valor === "-∞" || item.valor === "∞") return {
        valor: item.valor,
        pasos: 1
      }
    }
    return undefined
  }
  static isRangoArrayOk(rango: rangoValor[], _pazoz: number): stateRango | undefined { //undefined en caso de error
    let _rango: tipoValor[] = [], _pasos: number[] = []
    let n = rango.length
    if ( n < 2) return undefined // mìnimo de elementos en un array es 2
    let itemInicial: objValor = this.obtItem(rango[0], _pazoz)!
    let itemFinal: objValor = this.obtItem(rango[n - 1], _pazoz)!
    if (!itemInicial || !itemFinal) return undefined
    let _inicio: tipoValor = itemInicial.valor
    let _fin: tipoValor = itemFinal.valor
    let _inicioInfinito: number | undefined = typeof(_inicio) !== "number" ? 1 : undefined
    let _finalInfinito: number | undefined = typeof(_fin) !== "number" ? n - 2 : undefined
    let x = 0
    if (_inicioInfinito) x++
    if (_finalInfinito) x++
    if (x == 2) x++
    if (n < 2 + x) return undefined //minimo de elementos con un infinito es 3, con dos es 5
    if (_inicio === _fin) return undefined // inicio y fin no pueden ser iguales
    let incremental: boolean = (_inicio === "-∞" || _fin === "∞") || !(_inicioInfinito || _finalInfinito || _inicio > _fin)
    _rango = [_inicio]
    _pasos = [typeof(_inicio) === "number" ? Math.round(Math.max(itemInicial.pasos!, 0)) : 0]
    let lastValor: tipoValor = _inicio
    let j = (typeof(_fin) === "number") ? n : n - 1
    for(let i = 1; i < j; i++) {
      let item: objValor = this.obtItem(rango[i], _pazoz)!
      if (!item ||
          (typeof(item.valor) !== "number") ||
          (incremental && (lastValor !== "-∞") && (lastValor > item.valor)) ||
          (!incremental && (lastValor !== "∞") && (lastValor < item.valor))
        ) return undefined // algùn elemento del array no es vàlido o tiene un valor contrasentido
      _rango.push(item.valor)
      _pasos.push(Math.round(Math.max(item.pasos!, 0)))
      lastValor = item.valor
    }
    let _segmentos = n - 1
    if (_inicioInfinito) _segmentos--
    if (_finalInfinito) _segmentos--
    if (typeof(_fin) !== "number") {
      _rango.push(_fin)
      _pasos[j - 1] = 0
      _pasos.push(0)
    }
    _pasos[n - 1] = 0
    // if (_inicioInfinito) _pasos[1] -= 1
    // if (_finalInfinito) _pasos[j - 2] -= 1
    return  {incremental, _inicio, _fin, _rango, _pasos, _segmentos, _inicioInfinito, _finalInfinito} //state calculado del array
  }
  static obtRango(rango: tipoRango | null, segmentos: number, _pazoz: number): stateRango | undefined { // undefined en caso de error
    let _inicio: tipoValor, _fin: tipoValor
    if (rango && !Array.isArray(rango) && typeof(rango) === "object" &&
      typeof(rango.inicio!) === "number" &&
      typeof(rango.fin!) === "number" &&
      rango.inicio !== rango.fin
    ) {
      _inicio = rango.inicio
      _fin = rango.fin
    } else {
      _inicio = (rangoDefault.rango as tipoRango).inicio
      _fin = (rangoDefault.rango as tipoRango).fin
    }
    let _rango: tipoValor[] = [], _pasos: number[] = []
    let _segmentos = (typeof(segmentos) === "number" && segmentos >= 0.5) ? Math.round(segmentos) : (rangoDefault as rangoSimple).segmentos!
    let delta = (_fin - _inicio) / _segmentos
    let val = _inicio
    for(let i = 0; i < _segmentos; i++) {
      _rango.push(val)
      _pasos.push(_pazoz)
      val += delta
    }
    return { incremental: _inicio < _fin, _inicio, _fin, _rango, _pasos, _segmentos }
  }
  static pos2valor(state: stateRango, pos: number, esUno: boolean): { pos: number, valor: tipoValor, minimo?: number } {
    let { longitud, salto, _segmentos, _inicio, _fin, _rango, _pasos, _inicioInfinito, _finalInfinito, solapar } = state,
      r = Math.min(Math.max(0, pos!), longitud!) / salto!, // identifica la posición relativa en número de segmentos
      a = Math.floor(r), // identifica el inicio del segmento
      base: number = a * salto!,
      largo: number = salto!,
      posicion: number = pos - base,
      aInf: boolean = !!_inicioInfinito && (a++>-1) && (a === 1), // identifica si inicia con un infinito, a++, y es el primer segmento
      b = a + 1, // identifica el final del segmento
      bInf: boolean = !!_finalInfinito && (b >= _segmentos!), // identifica si termina con un infinito
      pasosSegmento = ((aInf || bInf) && (_pasos![a] === 1)) ? 2 : _pasos![a], // si es infinito, el mínimo son 2 pasos, o 0 pasos (continuo).
      _limite = (pasosSegmento >= 1) ? (salto! / pasosSegmento / 2) : LIMITE, // si hay pasos, el lìmite es medio paso, sino el default
      _2limite = _limite * 2,
      minimo = (esUno && !solapar) ? _2limite : (solapar ? 0 : undefined)
    if (pos === 0) return { pos, valor: _inicio!, minimo  }
    else if (pos === longitud!) return { pos, valor: _fin!, minimo }
    else if (aInf || bInf) {
      if (pos < _limite) return { pos: 0, valor: _inicio!, minimo } // si está a medio paso del infinito, infinito
      if (pos <= _2limite) return { pos: _2limite, valor: _rango![a!], minimo } // sino, el primer valor de inicio no infinito
      if (pos >= (longitud! - _limite)) return { pos: longitud!, valor: _fin!, minimo }
      if (pos >= (longitud! - _2limite)) return { pos: longitud! - _2limite, valor: _rango![b!], minimo }
      // si llegó acá, estamos en el primer segmento hay que determinar el valor y/o la posición precisa.
      if (pasosSegmento > 0) pasosSegmento--
      largo = largo - _2limite
      if (aInf) {
        base += _2limite
        posicion -= _2limite
      }
    }
    let ratio = pasosSegmento ? Math.round(posicion * pasosSegmento / largo) / pasosSegmento : posicion / largo,
      posX = pasosSegmento ? base + ratio * largo : pos,
      aV = _rango![a] as number, // el valor en el inicio del segmento
      bV = _rango![b] as number, // el valor en el final del segmento
      valor = aV + (bV - aV) * ratio
    console.log(minimo, solapar)
    return { pos: posX, valor, minimo }
  }
  static valor2pos(state: stateRango, valor: tipoValor, esUno: boolean): { pos: number, valor: tipoValor, minimo?: number } {
    let { longitud, salto, _segmentos, _inicio, _fin, _rango, _pasos, _inicioInfinito, _finalInfinito, incremental, solapar } = state,
      factor = incremental ? 1 : -1,
      primero = _inicioInfinito ? 1 : 0,
      ultimo = primero + _segmentos!,
      aV = _rango![primero] as number,
      bV = _rango![ultimo] as number,
      a = 0,
      i = primero,
      resp: any
    if (valor === _inicio) resp = { pos: 0, valor }
    else if (valor === _fin) resp = { pos: longitud!, valor }
    else if (typeof(valor) !== "number") resp = { pos: 0, valor: _inicio! }
    else if (factor * (aV - valor!) > 0) resp = { pos: 0, valor: _inicio! }
    else if (factor * (bV - valor!) < 0) resp = { pos: longitud!, valor: _fin! }
    else for(; i < ultimo; i++) {
      aV = _rango![ i ] as number
      bV = _rango![ i + 1 ] as number
      if ((incremental && (aV <= valor) && (valor < bV)) || (!incremental && (aV >= valor) && (valor > bV))) {
        a = i
        break
      }
      a = i
    }
    if ( esUno && resp && resp.pos === 0 && _inicioInfinito ) {
      a = _inicioInfinito
      aV = _rango![ a ] as number
      bV = _rango![ a + 1 ] as number
    }
    let b = a + 1,
      aInf = (a === _inicioInfinito),
      bInf = (b === _finalInfinito),
      pasosSegmento = ((aInf || bInf) && (_pasos![a] === 1)) ? 2 : _pasos![a],
      _limite = (pasosSegmento >= 1) ? (salto! / pasosSegmento / 2) : LIMITE,
      _2limite = _limite * 2,
      minimo = (esUno && !solapar) ? _2limite : (solapar ? 0 : undefined),
      base = aInf ? _2limite : ((a - primero) * salto!),
      largo = salto! - ((aInf || bInf) ? _2limite : 0),
      ratio = pasosSegmento ? Math.round((valor as number - aV) / (bV - aV) * pasosSegmento) / pasosSegmento : (valor as number - aV) / (bV - aV),
      pos = base + ratio * largo,
      valorX = aV + ratio * (bV - aV)
    console.log(minimo, solapar)
    return resp ? {...resp, minimo} : { pos, valor: valorX, minimo }
  }
  static getDerivedStateFromProps(nextProps: propsRango, state: stateRango): stateRango | null {
    let { presionado1, presionado2 } = state
    if ( presionado1 || presionado2 ) return null
    let newRango: stateRango | undefined = undefined,
      { rango, pasos, segmentos, solapar } = nextProps as propsRango & rangoSimple,
      newState: stateRango | undefined = !!state ? undefined : { rango, pasos, segmentos },
      _pazoz: number = (typeof(pasos) === "number" && pasos >= 0.5) ? Math.round(pasos) : rangoDefault.pasos!
    //console.log(solapar)
    if (!state || RangeSlider.rangoCambia(nextProps, state)) {
      if (!(rango && Array.isArray(rango) && (newRango = RangeSlider.isRangoArrayOk(rango as rangoValor[], _pazoz))))
        newRango = RangeSlider.obtRango(rango as tipoRango, segmentos!, _pazoz)
    }
    let {longitud, longitudPrev, dual: dualPrev} = state,
      {dual} = nextProps,
      valores: stateRango | undefined = undefined
    if (longitud && ((longitud !== longitudPrev) || newRango || (dual !== dualPrev))) {
      let { _segmentos, _inicio, _fin, _rango, _pasos, _inicioInfinito, _finalInfinito, incremental } = newRango || state,
        { valor1: valor1prev, valor2: valor2prev } = state,
        salto = longitud! / _segmentos!,
        tempState: stateRango = { longitud, salto, _segmentos, _inicio, _fin, _rango, _pasos, _inicioInfinito, _finalInfinito, incremental },
        x,
        uno = {
          valor1: (x = RangeSlider.valor2pos(tempState, ((typeof(valor1prev) !== 'undefined') ? valor1prev : ((typeof(nextProps.valor1) !== 'undefined') ? nextProps.valor1 : _inicio!)), true
          )).valor,
          pos1: x.pos as number,
          posPrev1: x.pos as number,
          presionado1: false
        },
        minimo = solapar ? 0 : x.minimo,
        dos = dual ? {
          valor2: (x = RangeSlider.valor2pos(tempState, ((typeof(valor2prev) !== 'undefined') ? valor2prev : ((typeof(nextProps.valor2) !== 'undefined') ? nextProps.valor2 : _fin!)), false
          )).valor,
          pos2: x.pos as number,
          posPrev2: x.pos as number,
          presionado2: false
        } : undefined
      valores = { longitud, longitudPrev: longitud, salto, dual, ...uno, ...dos, minimo, solapar }
    }
    console.log({...newState, ...newRango, ...valores})
    //console.log(state)
    //@ts-ignore
    if (newState || newRango || valores) return {...newState, ...newRango, ...valores}
    return null
  }
  //#endregion StaticFuncs
  componentDidMount() {
    const customPanResponder = (start: funcType, move: funcGest, end: funcType): PanResponderInstance => {
      return PanResponder.create({
        onStartShouldSetPanResponder: (evt, gestureState) => true,
        onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
        onMoveShouldSetPanResponder: (evt, gestureState) => true,
        onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
        onPanResponderGrant: (evt, gestureState) => start(),
        onPanResponderMove: (evt, gestureState) => move(gestureState),
        onPanResponderTerminationRequest: (evt, gestureState) => false,
        onPanResponderRelease: (evt, gestureState) => end(),
        onPanResponderTerminate: (evt, gestureState) => end(),
        onShouldBlockNativeResponder: (evt, gestureState) => true,
      })
    }
    this._panResponderOne = customPanResponder(()=>this.iniciaMov(UNO), (mov)=>this.mueve(UNO, mov), ()=>this.finMov(UNO))
    this._panResponderTwo = customPanResponder(()=>this.iniciaMov(DOS), (mov)=>this.mueve(DOS, mov), ()=>this.finMov(DOS))
  }
  iniciaMov(esUno: boolean) {
    if (this.props.enabled) {
      this.props.onValuesChangeStart!()
      this.setState( esUno ? { presionado1: true} : { presionado2: true})
    }
  }
  finMov(esUno: boolean) {
    this.setState( esUno ? { posPrev1: this.state.pos1, presionado1: false } : { posPrev2: this.state.pos2, presionado2: false },
      () => this.props.onValuesChangeFinish!(this.state.valor1!, this.state.valor2!)
    )
  }
  mueve(esUno: boolean, {dx, dy}: PanResponderGestureState) {
    let { enabled, touchDimensions, onValuesChange } = this.props
    if (!enabled) return
    let { longitud, pos1, pos2, posPrev1, posPrev2, valor1, valor2, dual, minimo } = this.state
    let posPrev, valor
    if (esUno) { posPrev = posPrev1; valor = valor1; } else { posPrev = posPrev2; valor = valor2; }
    let nuevaPos = I18nManager.isRTL ? (posPrev! - dx) : (posPrev! + dx)
    let bottom = esUno ? 0 : pos1! + minimo!
    let top = (esUno && dual) ? pos2! - minimo! : longitud!
    nuevaPos = (nuevaPos < bottom!) ? bottom : (nuevaPos > top!) ? top : nuevaPos
    if (Math.abs(dy) < touchDimensions!.slipDisplacement! || !touchDimensions!.slipDisplacement!) {
      let estado = RangeSlider.pos2valor(this.state, nuevaPos, esUno)
      this.setState(esUno ? {pos1: estado.pos, minimo: estado.minimo } : {pos2: estado.pos})
      if (valor !== estado.valor) 
        this.setState(esUno ? {valor1: estado.valor} : {valor2: estado.valor},
          () => { if (onValuesChange) onValuesChange (this.state.valor1!, dual ? this.state.valor2! : undefined) }
        )
    }
  }
  ponLongitud(longitud: number) {
    if (longitud !== this.state.longitud)
      this.setState({ longitud }, ()=>this.setState(RangeSlider.getDerivedStateFromProps(this.props, this.state)))
  }
  render(): JSX.Element {
    const
      { pos1, pos2, longitud, dual, presionado1, presionado2, valor1, valor2, salto, _rango, _pasos, _segmentos, _inicioInfinito, _finalInfinito } = this.state ,
      { selectedStyle, unselectedStyle, textStyle, dividerStyle, trackStyle, containerStyle, markerContainerStyle, markerStyle, pressedMarkerStyle, touchDimensions, customMarker, markerOffsetX, markerOffsetY, valuePrefix, valueSuffix, etiquetas, enabled } = this.props,
      trackThreeLength = dual ? longitud! - pos2! : 0,
      trackOneLength = pos1!,
      trackTwoLength = longitud! - trackOneLength! - trackThreeLength,
      trackOneStyle = dual ? [unselectedStyle] : [RangeStyles.selectedTrack, selectedStyle],
      trackTwoStyle = dual ? [RangeStyles.selectedTrack, selectedStyle] : [unselectedStyle],
      trackThreeStyle = unselectedStyle,
      MarkerLeft = this.props.customMarkerLeft! || customMarker!,
      MarkerRight = this.props.customMarkerRight! || customMarker!,
      { height, width, borderRadius } = touchDimensions!,
      touchStyle = { borderRadius, height, width },
      markerContainerOne = { top: markerOffsetY! - 24, left : trackOneLength + markerOffsetX! - 24 },
      markerContainerTwo = { top: markerOffsetY! - 24, right: trackThreeLength + markerOffsetX! - 24 },
      margin = (width || 0) / 2 + 5,
      marginV = (height || 0) / 2 + 5
    return (
      <View style={[RangeStyles.container, containerStyle]}
        onLayout = {({ nativeEvent: { layout: { width }}}) => this.ponLongitud(width - margin * 2)}
      >
        { longitud && 
          <Ruler
            { ...{ etiquetas, longitud, _rango, _segmentos, _inicioInfinito, _finalInfinito }}
            style = {{ marginHorizontal: margin }}
            textStyle = { textStyle }
            dividerStyle = { dividerStyle }
          />
        }
        { longitud &&
          <View style = {[ RangeStyles.fullTrack, { width: longitud, margin: margin, marginTop: etiquetas ? 0 : marginV } ]} >
            <View style = {[ RangeStyles.track, trackStyle, ...trackOneStyle, { width: trackOneLength } ]} />
            <View style = {[ RangeStyles.track, trackStyle, ...trackTwoStyle, { width: trackTwoLength } ]} />
           { dual &&
            <View style = {[ RangeStyles.track, trackStyle, trackThreeStyle, { width: trackThreeLength } ]} />
           }
            <View style = {[ RangeStyles.markerContainer, markerContainerOne, markerContainerStyle, (pos1! > (longitud! / 2)) && RangeStyles.topMarkerContainer ]} >
              <View style = {[ RangeStyles.touch, touchStyle ]} { ...this._panResponderOne!.panHandlers } >
                <MarkerLeft {...{ enabled, markerStyle, pressedMarkerStyle, valuePrefix, valueSuffix }}
                  pressed = { presionado1 }
                  currentValue = { valor1! }
                />
              </View>
            </View>
           { dual && pos1 !== longitud &&
            <View style = {[ RangeStyles.markerContainer, markerContainerTwo, markerContainerStyle ]} >
              <View style = {[ RangeStyles.touch, touchStyle ]} { ...this._panResponderTwo!.panHandlers } >
                <MarkerRight {...{ enabled, markerStyle, pressedMarkerStyle, valuePrefix, valueSuffix }}
                  pressed = { presionado2 }
                  currentValue = { valor2! }
                />
              </View>
            </View>
           }
          </View>
        }
      </View>
    )
  }
}
//#endregion RANGESLIDER

//#region RULER
export interface RulerProps {
  etiquetas?: boolean | "edges" ,
  longitud?: number
  _rango?: tipoValor[]
  _segmentos?: number
  _inicioInfinito?: number
  _finalInfinito?: number
  style?: ViewStyle
  textStyle?: TextStyle
  dividerStyle?: ViewStyle
}
export class Ruler extends Component<RulerProps> {
  shouldComponentUpdate(nextProps: RulerProps): boolean {
    return (this.props.etiquetas !== nextProps.etiquetas ||
      this.props.longitud !== nextProps.longitud
    )
  }
  render(): JSX.Element | null {
    let { etiquetas, longitud, _segmentos, style, _rango, _inicioInfinito, _finalInfinito, dividerStyle, textStyle} = this.props,
      espacio = (longitud! - hairWidth) / _segmentos! - hairWidth
    if (!etiquetas) return null
    return (
      <View style={[style, RulerStyles.container]}>
        { (etiquetas === "edges") ? (
            <View style={RulerStyles.innerContainer}>
              <View key = "a" style={RulerStyles.textContainer}>
                <Text style={[RulerStyles.text, textStyle, RulerStyles.textBox]}>
                  { _rango![0] }
                </Text>
              </View>
              <View key = "s" style={{width: longitud! - hairWidth * 2 }} />
              <View key = "b" style={RulerStyles.textContainer}>
                <Text style={[RulerStyles.text, textStyle, RulerStyles.textBox]}>
                  { _rango![_rango!.length - 1] }
                </Text>
              </View>
            </View>
          ) : (
            <View style={RulerStyles.innerContainer}>
              { _rango!.map((valor: tipoValor, index:number)=>{
                return (index === _inicioInfinito || index == _finalInfinito) ? null : (
                  <View key={index.toString()} style={RulerStyles.innerContainer}>
                    { !!index && <View style={{width: espacio }} /> }
                    <View style={RulerStyles.textContainer}>
                      <Text style={[RulerStyles.text, textStyle, RulerStyles.textBox]}>
                        { /* (typeof(valor) === "number") ? */ valor/* .toString() : valor */ }
                      </Text>
                    </View>
                </View> )
              })}
            </View>
          )
        }
        <View style={RulerStyles.markerContainer}>
          { _rango!.map((_, index:number)=>{
            return (index === _inicioInfinito || index === _finalInfinito) ? null : (
              <View key={index.toString()} style={RulerStyles.innerContainer}>
                { !!index && <View style={{width: espacio }} /> }
                <View style={[RulerStyles.divider, dividerStyle, {width: hairWidth }]} />
              </View> )
          })}
        </View>
      </View> )
  }
}
//#endregion RULER

//#region STYLES
const markColor = 'darkgray'
const textColor = 'darkgray'

const RangeStyles = StyleSheet.create({
  container: { position: 'relative' },
  fullTrack: { flexDirection: 'row' },
  track: { height: StyleSheet.hairlineWidth * 5, borderRadius: StyleSheet.hairlineWidth * 2.5, backgroundColor: markColor },
  selectedTrack: { backgroundColor: 'purple' },
  markerContainer: { position: 'absolute', width: 50, height: 50, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' },
  topMarkerContainer: { zIndex: 1 },
  touch: { backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center', alignSelf: 'stretch' },
})
const Markerstyles = StyleSheet.create({
  markerStyle: { height: 30, width: 30, borderRadius: 15, borderWidth: StyleSheet.hairlineWidth * 2, borderColor: '#DDDDDD', backgroundColor: '#FFFFFF',
    ...Platform.select({ 
      ios: { shadowColor: '#000000', shadowOffset: { width: 0, height: StyleSheet.hairlineWidth * 3}, shadowRadius: 1, shadowOpacity: 0.2 },
      android: { margin: StyleSheet.hairlineWidth * 10, elevation: StyleSheet.hairlineWidth * 5 },
    }),
  },
  pressedMarkerStyle: { },
  disabled: { backgroundColor: '#d3d3d3' },
})
const RulerStyles = StyleSheet.create({
  container: { flexDirection: 'column' },
  innerContainer: {flex: 0, flexDirection: 'row'},
  markerContainer: {flex: 0, flexDirection: 'row'},
  textContainer: {flex: 0, alignItems: 'center', alignContent: 'center', width: hairWidth, overflow: 'visible'},
  divider: {height: 10, marginTop: 3, marginBottom: 7, backgroundColor: markColor },
  text: {fontSize: 16, color: textColor},
  textBox: {textAlign: 'center', width: 40}
})
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
