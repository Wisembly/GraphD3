var Raphael, d3;

// --------------------------------------------------------------------------------------

var Chart = function ( ) {

    this._vScale = d3.scale.linear( );
    this._hScale = d3.scale.linear( );

};

Chart.prototype.name = null;

Chart.prototype.hRawAccessor = function ( d ) {

    return d[ 0 ];

};

Chart.prototype.vRawAccessor = function ( d ) {

    return d[ 1 ];

};

Chart.prototype.hIntAccessor = function ( d ) {

    return +this.hRawAccessor( d );

};

Chart.prototype.vIntAccessor = function ( d ) {

    return +this.vRawAccessor( d );

};

Chart.prototype.each = function ( cb, context ) {

    cb.call( context, this );

};

Chart.prototype.hDomain = function ( ) {

    return [ this._hDomainMin, this._hDomainMax ];

};

Chart.prototype.vDomain = function ( ) {

    return [ this._vDomainMin, this._vDomainMax ];

};

Chart.prototype.hScale = function ( hScale ) {

    if ( typeof hScale === 'undefined' )
        return this._hScale;

    this._hScale = hScale;

    return this;

};

Chart.prototype.vScale = function ( vScale ) {

    if ( typeof vScale === 'undefined' )
        return this._vScale;

    this._vScale = vScale;

    return this;

};

Chart.prototype.data = function ( data ) {

    if ( typeof data === 'undefined' )
        return this._data;

    this._data = data;

    var that = this;

    var hIntAccessorBinding = function ( ) { return that.hIntAccessor.apply( that, arguments ); };
    var vIntAccessorBinding = function ( ) { return that.vIntAccessor.apply( that, arguments ); };

    this._hDomainMin = d3.min( this._data, hIntAccessorBinding );
    this._hDomainMax = d3.max( this._data, hIntAccessorBinding );

    this._vDomainMin = d3.min( this._data, vIntAccessorBinding );
    this._vDomainMax = d3.max( this._data, vIntAccessorBinding );

    return this;

};

// --------------------------------------------------------------------------------------

var MultiChart = function ( ) {

    this._charts = [ ];

};

MultiChart.prototype.each = function ( cb, context ) {

    for ( var t = 0, T = this._charts.length; t < T; ++ t )
	this._charts[ t ].each( cb, context );

    return this;

};

MultiChart.prototype.add = function ( chart ) {

    if ( this._charts.indexOf( chart ) === -1 )
	this._charts.push( chart );

    return this;

};

MultiChart.prototype.remove = function ( chart ) {

    var position = this._charts.indexOf( chart );
    if ( position !== -1 )
	this._charts.splice( position, 1 );

    return this;

};

// --------------------------------------------------------------------------------------

var ChartDisplay = function ( ) {

    this.node = document.createElement( 'div' );
    this.node.setAttribute( 'class', 'chart' );

    this.raph = Raphael( this.node, 0, 0 );

    this._boundLeft = 0;
    this._boundRight = 1;

};

ChartDisplay.prototype._focusChart = function ( chart ) {

    this._tooltip && this._tooltip.remove( );
    this.node.setAttribute( 'class', 'chart ' + chart.name );

};

ChartDisplay.prototype._displayTooltip = function ( x, y, chart, value ) {

    var that = this;

    this._focusChart( chart );

    this._tooltip && this._tooltip.remove( );
    this._tooltip = this.raph.set( );
    this._elementsList.push( this._tooltip );

    var text = this.raph.text( x, y, d3.format( ',.3g' )( value ) );
    text.node.setAttribute( 'class', 'tooltip text' );
    text.node.removeAttribute( 'stroke' );
    text.node.removeAttribute( 'fill' );
    this._tooltip.push( text );

    var bbox = text.getBBox( );

    var background = this.raph.rect( bbox.x - 5, bbox.y - 5, bbox.width + 10, bbox.height + 10, 5 ).insertBefore( text );
    background.node.setAttribute( 'class', 'tooltip background' );
    background.node.removeAttribute( 'stroke-width' );
    background.node.removeAttribute( 'stroke' );
    background.node.removeAttribute( 'fill' );
    this._tooltip.push( background );

};

ChartDisplay.prototype._buildGrids = function ( hScale, vScale, chart, options ) {

    var hTicks = hScale.ticks.apply( hScale, options.ticks || [ 10 ] );
    var vTicks = vScale.ticks( 10 );


    var hLines = [ ];
    for ( var u = 0, U = hTicks.length; u < U; ++ u ) {
	var hPosition = hScale( hTicks[ u ] );
        hLines.push( [ 'M', hPosition, 0, 'L', hPosition, this.raph.height - ( options.labels !== false ? 30 : 0 ) ] );
    }

    var vLines = [ ];
    for ( var v = 0, V = vTicks.length; v < V; ++ v ) {
	var vPosition = vScale( vTicks[ v ] );
	vLines.push( [ 'M', 0, vPosition, 'L', this.raph.width, vPosition ] );
    }

    var hLinesPath, vLinesPath;
    this._elementsList.push( hLinesPath = this.raph.path( hLines ) );
    this._elementsList.push( vLinesPath = this.raph.path( vLines ) );

    hLinesPath.node.setAttribute( 'class', 'grid horizontal ' + chart.name );
    hLinesPath.node.removeAttribute( 'stroke-width' );
    hLinesPath.node.removeAttribute( 'stroke' );

    vLinesPath.node.setAttribute( 'class', 'grid vertical ' + chart.name );
    vLinesPath.node.removeAttribute( 'stroke-width' );
    vLinesPath.node.removeAttribute( 'stroke' );
};

ChartDisplay.prototype._buildLabels = function ( hScale, vScale, chart, options ) {

    var hTicks = hScale.ticks.apply( hScale, options.ticks || [ 10 ] );
    var hTicksFormater = hScale.tickFormat.apply( hScale, options.ticks || [ 10 ] );

    for ( var u = 0, U = hTicks.length; u < U; ++ u ) {

        var hPosition = hScale( hTicks[ u ] );
        var hLabel = this.raph.text( hPosition, this.raph.height - 15, hTicksFormater( hTicks[ u ] ) );
        hLabel.node.setAttribute( 'class', 'label horizontal ' + chart.name );
        hLabel.node.removeAttribute( 'stroke-width' );
        hLabel.node.removeAttribute( 'stroke' );
        hLabel.node.removeAttribute( 'fill' );

        var bbox = hLabel.getBBox( );
        if ( hLabel.getBBox( ).x < 0 ) {
            hLabel.remove( );
        } else {
            this._elementsList.push( hLabel );
        }

    }

};

ChartDisplay.prototype._buildLines = function ( hScale, vScale, chart, options ) {

    var data = chart.data( );

    var path = [ 'M', hScale( chart.hIntAccessor( data[ 0 ] ) ), vScale( chart.vIntAccessor( data[ 0 ] ) ) ];
    for ( var t = 1, T = data.length; t < T; ++ t )
        path = path.concat( [ hScale( chart.hIntAccessor( data[ t ] ) ), vScale( chart.vIntAccessor( data[ t ] ) ) ] );

    var line = this.raph.path( path );
    line.node.setAttribute( 'class', 'path ' + chart.name );
    line.node.removeAttribute( 'stroke-width' );
    line.node.removeAttribute( 'stroke' );
    this._elementsList.push( line );

    var that = this;
    line.mouseover( function ( ) {
        that._focusChart( chart );
    } );

};

ChartDisplay.prototype._buildMarks = function ( hScale, vScale, chart, options ) {

    var data = chart.data( );

    for ( var t = 0, T = data.length; t < T; ++ t ) {

        var xValue = chart.hIntAccessor( data[ t ] );
        var yValue = chart.vIntAccessor( data[ t ] );

        var x = hScale( xValue );
        var y = vScale( yValue );

        var pointer = this.raph.circle( x, y, 3 );
        pointer.node.setAttribute( 'class', 'pointer ' + chart.name );
        pointer.node.removeAttribute( 'stroke-width' );
        pointer.node.removeAttribute( 'stroke' );
        pointer.node.removeAttribute( 'fill' );
        this._elementsList.push( pointer );

        var hitbox = this.raph.circle( x, y, 10 );
        hitbox.node.setAttribute( 'class', 'hitbox ' + chart.name );
        hitbox.attr( 'stroke-width', '0' );
        hitbox.attr( 'stroke', 'transparent' );
        hitbox.attr( 'fill', 'transparent' );
        this._elementsList.push( hitbox );

        hitbox.click( ( function ( that, xValue, yValue ) {

            return function ( ) {
                if ( options.onClick ) {
                    options.onClick.call( that, xValue, yValue );
                }
            };

        } ( this, chart.hRawAccessor( data[ t ] ), chart.vRawAccessor( data[ t ] ) ) ) );

        var that = this;
        hitbox.mouseover( ( function ( x, y, chart, t ) {
            return function ( ) {
                that._displayTooltip( x, y, chart, chart.vIntAccessor( data[ t ] ) );
            };
        } ( x, y, chart, t ) ) );

    }

};

ChartDisplay.prototype._redraw = function ( options ) {

    this.raph.setSize( options.width || 700, options.height || 500 );

    this._elementsList && this._elementsList.remove( );
    this._elementsList = this.raph.set( );

    var hExtendedDomain = [ null, null ];
    var vExtendedDomain = [ null, null ];

    this._chart.each( function ( chart ) {

        var hDomain = chart.hDomain( );
        var vDomain = chart.vDomain( );

        if ( hExtendedDomain[ 0 ] === null || hExtendedDomain[ 0 ] > hDomain[ 0 ] )
            hExtendedDomain[ 0 ] = hDomain[ 0 ];
        if ( hExtendedDomain[ 1 ] === null || hExtendedDomain[ 1 ] < hDomain[ 1 ] )
            hExtendedDomain[ 1 ] = hDomain[ 1 ];

        if ( vExtendedDomain[ 0 ] === null || vExtendedDomain[ 0 ] > vDomain[ 0 ] )
            vExtendedDomain[ 0 ] = vDomain[ 0 ];
        if ( vExtendedDomain[ 1 ] === null || vExtendedDomain[ 1 ] < vDomain[ 1 ] )
            vExtendedDomain[ 1 ] = vDomain[ 1 ];

    } );

    var start = hExtendedDomain[ 0 ];
    var diff = hExtendedDomain[ 1 ] - hExtendedDomain[ 0 ];
    hExtendedDomain[ 0 ] = start + diff * this._boundLeft;
    hExtendedDomain[ 1 ] = start + diff * this._boundRight;

    var allScales = { };

    var u = 0;
    this._chart.each( function ( chart ) {

        var vFinalDomain = options.linkVDomains !== false ? vExtendedDomain : chart.vDomain( );

        allScales[ u++ ] = [
            chart.hScale( ).copy( ).domain( hExtendedDomain ).range( [ 10, this.raph.width - 10 ] ),
            chart.vScale( ).copy( ).domain( vFinalDomain ).range( [ this.raph.height - ( options.labels !== false ? 30 : 0 ) - 10, 10 ] ).nice( )
        ];

    }, this );

    var v = 0;
    this._chart.each( function ( chart ) {
        var scales = allScales[ v++ ];
	this._buildGrids( scales[ 0 ], scales[ 1 ], chart, options );
    }, this );

    var w = 0;
    if ( options.labels !== false )
    this._chart.each( function ( chart ) {
        var scales = allScales[ w++ ];
        this._buildLabels( scales[ 0 ], scales[ 1 ], chart, options );
    }, this );

    var x = 0;
    this._chart.each( function ( chart ) {
        var scales = allScales[ x++ ];
	this._buildLines( scales[ 0 ], scales[ 1 ], chart, options );
    }, this );

    var y = 0;
    this._chart.each( function ( chart ) {
        var scales = allScales[ y++ ];
	this._buildMarks( scales[ 0 ], scales[ 1 ], chart, options );
    }, this );

    var firstChart = null;
    this._chart.each( function ( chart ) {
        firstChart = firstChart || chart;
    } );

    this._focusChart( firstChart );

};

ChartDisplay.prototype.chart = function ( chart, options ) {

    this._options = options;

    this._chart = chart;

    this._redraw( options );

    return this;

};

ChartDisplay.prototype.bound = function ( left, right ) {

    if ( left < 0 ) left = 0; if ( left > 1 ) left = 1;
    if ( right < 0 ) right = 0; if ( right > 1 ) right = 1;

    if ( left > right ) {
	var temp = left;
	left = right;
	right = temp;
    }

    this._boundLeft = left;
    this._boundRight = right;

    this._redraw( this._options );

    return this;

};

// --------------------------------------------------------------------------------------

var SelectorDisplay = function ( ) {

    this.node = document.createElement( 'div' );
    this._containerTop = document.createElement( 'div' );
    this._containerBottom = document.createElement( 'div' );
    this._selectorLeft = document.createElement( 'div' );
    this._selectorRight = document.createElement( 'div' );
    this._selection = document.createElement( 'div' );

    this.node.setAttribute( 'class', 'selectordisplay' );
    this._containerTop.setAttribute( 'class', 'container top' );
    this._containerBottom.setAttribute( 'class', 'container bottom' );
    this._selectorLeft.setAttribute( 'class', 'selector left' );
    this._selectorRight.setAttribute( 'class', 'selector right' );
    this._selection.setAttribute( 'class', 'selection' );

    this.node.appendChild( this._containerTop );
    this.node.appendChild( this._containerBottom );
    this._containerBottom.appendChild( this._selectorLeft );
    this._containerBottom.appendChild( this._selectorRight );
    this._containerBottom.appendChild( this._selection );

    this._boundLeft = 0;
    this._boundRight = 1;

    this._initEventListeners( );

};

SelectorDisplay.prototype._initEventListeners = ( function ( ) {

    var selectedChart;

    var initGlobalEventListeners = function ( ) {

        window.addEventListener( 'mousemove', function ( e ) {
            selectedChart && selectedChart( e.clientX );
        }, false );

        window.addEventListener( 'mouseup', function ( ) {
            selectedChart = null;
        }, false );

        selectedChart = null;

    };

    var computeOffsetLeft = function ( element ) {

        for ( var offset = 0; element; element = element.offsetParent )
            offset += element.offsetLeft;

        return offset;

    };

    return function ( ) {

        if ( typeof selectedChart === 'undefined' )
            initGlobalEventListeners( );

        var that = this;

        var min = 1e-5;

        this._selectorLeft.addEventListener( 'mousedown', function ( ) {
            selectedChart = function ( x ) {
                var left = ( x - computeOffsetLeft( that._containerBottom ) ) / that._bottom.raph.width, right = that._boundRight, diff = right - left;
                if ( diff < min ) right = left + min;
                if ( right > 1 ) right = 1, left = right - min;
                that.bound( left, right );
            };
        }, false );

        this._selectorRight.addEventListener( 'mousedown', function ( ) {
            selectedChart = function ( x ) {
                var left = that._boundLeft, right = ( x - computeOffsetLeft( that._containerBottom ) ) / that._bottom.raph.width, diff = right - left;
                if ( diff < min ) left = right - min;
                if ( left < 0 ) left = 0, right = left + min;
                that.bound( left, right );
            };
        }, false );

    };

} ( ) );

SelectorDisplay.prototype.chart = function ( chart, options ) {

    options = options || { };

    this._top && this._top.node.parentNode.removeChild( this._top.node );
    this._bottom && this._bottom.node.parentNode.removeChild( this._bottom.node );

    var TopOptionsBuilder = function ( ) { };
    TopOptionsBuilder.prototype = options.top || { };
    var topOptions = new TopOptionsBuilder( );
    if ( typeof topOptions.linkVDomains === 'undefined' && typeof options.linkVDomains !== 'undefined' )
        topOptions.linkVDomains = options.linkVDomains;
    topOptions.width = topOptions.width || ( options.width || 700 );
    topOptions.height = topOptions.height || ( options.height || 300 ) * 4/5;
    this._top = new ChartDisplay( ).chart( chart, topOptions );

    var BottomOptionsBuilder = function ( ) { };
    BottomOptionsBuilder.prototype = options.bottom || { };
    var bottomOptions = new BottomOptionsBuilder( );
    if ( typeof bottomOptions.linkVDomains === 'undefined' && typeof options.linkVDomains !== 'undefined' )
        bottomOptions.linkVDomains = options.linkVDomains;
    bottomOptions.width = bottomOptions.width || ( options.width || 700 );
    bottomOptions.height = bottomOptions.height || ( options.height || 300 ) * 1/5;
    bottomOptions.labels = false;
    this._bottom = new ChartDisplay( ).chart( chart, bottomOptions );

    this._selection.style.height = this._selectorLeft.style.height = this._selectorRight.style.height = this._bottom.raph.height + 'px';

    this._containerTop.appendChild( this._top.node );
    this._containerBottom.appendChild( this._bottom.node );

    this.bound( this._boundLeft, this._boundRight );

    return this;

};

SelectorDisplay.prototype.bound = function ( left, right ) {

    if ( left < 0 ) left = 0; if ( left > 1 ) left = 1;
    if ( right < 0 ) right = 0; if ( right > 1 ) right = 1;

    if ( left > right ) {
	var temp = left;
	left = right;
	right = temp;
    }

    this._boundLeft = left;
    this._boundRight = right;

    this._selectorLeft.style.left = ( left * this._bottom.raph.width ) + 'px';
    this._selectorRight.style.left = ( right * this._bottom.raph.width ) + 'px';
    this._selection.style.left = ( left * this._bottom.raph.width ) + 'px';
    this._selection.style.width = ( ( right - left ) * this._bottom.raph.width ) + 'px';

    this._top.bound( left, right );

    return this;

};
