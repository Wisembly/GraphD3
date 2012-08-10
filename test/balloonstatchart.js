var MultiChart, Chart;

var BalloonStatChart = ( function ( ) {

    var QuotesChart = function ( ) {

        Chart.call( this );

        this.hScale( d3.time.scale( ) );

    };

    QuotesChart.prototype = ( function ( ) {

        var F = function ( ) { };
        F.prototype = Chart.prototype;
        return new F( );

    }( ) );

    QuotesChart.prototype.name = 'quotes';

    var VotesChart = function ( ) {

        Chart.call( this );

        this.hScale( d3.time.scale( ) );

    };

    VotesChart.prototype = ( function ( ) {

        var F = function ( ) { };
        F.prototype = Chart.prototype;
        return new F( );

    }( ) );

    VotesChart.prototype.name = 'votes';

    var StatChart = function ( ) {

        MultiChart.call( this );

        this._quotesChart = new QuotesChart( );
        this.add( this._quotesChart );

        this._votesChart = new VotesChart( );
        this.add( this._votesChart );

    };

    StatChart.prototype = ( function ( ) {

        var F = function ( ) { };
        F.prototype = MultiChart.prototype;
        return new F( );

    }( ) );

    StatChart.prototype.quotesData = function ( data ) {

        this._quotesChart.data( data );

        return this;

    };

    StatChart.prototype.votesData = function ( data ) {

        this._votesChart.data( data );

        return this;

    };

    return StatChart;

}( ) );
