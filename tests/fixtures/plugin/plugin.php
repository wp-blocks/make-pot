<?php
/**
 * Plugin Name: plugin
 * Plugin URI:
 * Description: An example plugin to demo how to do internationalization in a WordPress plugin.
 * Author: David Wood
 * Author URI: https://davidwood.ninja/
 * Version: 1.0.0
 * License: GPL3+
 * License URI: http://www.gnu.org/licenses/gpl-3.0.html
 * Text Domain: i18n-example
 * Domain Path: /languages
 */

/**
 * Load our plugin text domain. This will load translations for PHP code.
 */
function exampleSetup() {
	load_plugin_textdomain( 'i18n-example', false, basename( __DIR__ ) . '/languages' );
}

add_action( 'plugins_loaded', 'exampleSetup' );

/**
 * Enqueue our admin JS and tell WP to load our JS translations.
 *
 * @param string $hook Passed in from WP, the hook for the current admin screen.
 */
function exampleAdminEnqueueScripts( $hook ) {
	if ( 'toplevel_page_i18n' === $hook ) {
		// Enqueue our file.
		wp_enqueue_script( 'example-js', plugins_url( 'i18n-example.js', __FILE__ ), [ 'wp-i18n' ], false, true );

		// Tell WP to load translations for our JS.
		wp_set_script_translations( 'example-js', 'i18n-example', plugin_dir_path( __FILE__ ) . 'languages' );
	}
}

add_action( 'admin_enqueue_scripts', 'exampleAdminEnqueueScripts' );

/**
 * Add an admin page to see all our tests on.
 */
function exampleAddPage() {
	add_menu_page( esc_html__( 'I18n Example', 'i18n-example' ), esc_html__( 'I18n Example', 'i18n-example' ), 'manage_options', 'i18n', 'exampleAdminPage', 'dashicons-translation', 2 );
}

add_action( 'admin_menu', 'exampleAddPage' );

/**
 * Output for our admin page. Outputs a bunch of translatable strings preceded by static strings that will remain in English.
 */
function exampleAdminPage() {
	?>
    <style>
        .wrap p {
            font-size: 3em;
        }
    </style>
    <div class="wrap">
        <h2><?php esc_html_e( 'I18n Example', 'i18n-example' ); ?></h2>

        <p>
            You're a silly monkey<br/>
			<?php esc_html_e( 'You\'re a silly monkey', 'i18n-example' ); ?>
        </p>
        <p>
            I am 29 years old<br/>
			<?php printf(
			/* translators: %d is the users age. */
				esc_html__( 'I am %d years old', 'i18n-example' ),
				number_format_i18n( 29 )
			); ?>
        </p>
        <p>
            Post (2 meanings: article and submit)<br/>
			<?php echo esc_html_x( 'Post', 'noun', 'i18n-example' ); ?><br/>
			<?php echo esc_html_x( 'Post', 'verb', 'i18n-example' ); ?>
        </p>
        <p>
            I have 10 books<br/>
			<?php
			// List the message once, then try it out with 3 different numbers!
			$bookMessage = _n_noop( 'I have %s book', 'I have %s books', 'i18n-example' );
			$numberList  = [ 1, 4, 25 ];
			foreach ( $numberList as $number ) {
				printf(
					translate_nooped_plural( $bookMessage, $number, 'i18n-example' ),
					number_format_i18n( $number )
				);
				// Output a line break.
				echo '<br/>';
			}
			?>
        </p>
        <p>
            The following comes from JS:<br/>
            <span id="i18n-js-examples"></span>
        </p>
    </div>
	<?php
}
