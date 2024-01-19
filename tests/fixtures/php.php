<?php

__( 'Blog Options', 'my-plugin' );

echo __( 'WordPress is the best!', 'my-plugin' );

_e( 'WordPress is the best!', 'my-plugin' );

printf(
	/* translators: %s: Name of a city */
	__( 'Your city is %s.', 'my-plugin' ),
	$city
);

printf(
	/* translators: 1: Name of a city 2: ZIP code */
	__( 'Your city is %1$s, and your zip code is %2$s.', 'my-plugin' ),
	$city,
	$zipcode
);

printf(
	/* translators: 1: Name of a city 2: ZIP code */
	__( 'Your zip code is %2$s, and your city is %1$s.', 'my-plugin' ),
	$city,
	$zipcode
);

printf(
	_n(
		'%s comment',
		'%s comments',
		get_comments_number(),
		'my-plugin'
	),
	number_format_i18n( get_comments_number() )
);

if ( 1 === $count ) {
	printf( esc_html__( 'Last thing!', 'my-text-domain' ), $count );
} else {
	printf( esc_html( _n( '%d thing.', '%d things.', $count, 'my-text-domain' ) ), $count );
}

// comment
$comments_plural = _n_noop(
	'%s comment.',
	'%s comments.'
);
printf(
	translate_nooped_plural(
		$comments_plural,
		get_comments_number(),
		'my-plugin'
	),
	number_format_i18n( get_comments_number() )
);

//Disambiguation by context
_x( 'Post', 'noun', 'my-plugin' );
_x( 'Post', 'verb', 'my-plugin' );
_ex( 'Post', 'noun', 'my-plugin' );
_ex( 'Post', 'verb', 'my-plugin' );

/* translators: draft saved date format, see http://php.net/date */
$saved_date_format = __( 'g:i:s a' );

_n_noop( '<strong>Version %1$s</strong> addressed %2$s bug.','<strong>Version %1$s</strong> addressed %2$s bugs.' );

/* translators: 1: WordPress version number, 2: plural number of bugs. */
_n_noop( '<strong>Version %1$s</strong> addressed %2$s bug.','<strong>Version %1$s</strong>strong> addressed %2$s bugs.' );

// This is incorrect do not use.
_e( "Your city is $city.", 'my-plugin' );


printf(
	__( 'Search results for: %s', 'my-plugin' ),
	get_search_query()
);

// Use format strings instead of string concatenation – translate phrases and not words –
printf( __( 'Your city is %1$s, and your zip code is %2$s.', 'my-plugin' ), $city, $zipcode );

// is always better than:
__( 'Your city is ', 'my-plugin' ) . $city . __( ', and your zip code is ', 'my-plugin' ) . $zipcode;

// Try to use the same words and same symbols so not multiple strings needs to be translated e.g.
__( 'Posts:', 'my-plugin' ); and __( 'Posts', 'my-plugin' );
