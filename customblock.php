<?php
/**
 * Plugin Name:       Kiran
 * Description:       Example block scaffolded with Create Block tool.
 * Requires at least: 6.1
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            The WordPress Contributors
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       kiran
 *
 * @package           create-block
 */

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
 
function sample_command( $args ) {
	$data = getData();
	
	update_option('data-block',$data);
    WP_CLI::success( 'Thank you for running the sample command.'  );
}

function cli_init()
{
	WP_CLI::add_command( 'api', 'sample_command' );
}

function getData()
{
	$ch = curl_init();
	curl_setopt ($ch, CURLOPT_URL, "https://miusage.com/v1/challenge/1/");
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	$result = curl_exec($ch);
	curl_close($ch);
	return $result;
}

function create_block_customblock_block_init() {

	if(is_user_logged_in())
	{
		$data = get_option('data-block',false);
		$time = get_option('time',0);
		
		if(!$data || !$time || $time < time() - 3600) 
		{
			$data = getData();
			
			update_option('data-block',$data);
			update_option('time',time());
		}
		else if($data)
		{
			$data = json_decode($data,true);
		}

		$arg = get_option('api-disable','yes');
		register_block_type( __DIR__ . '/build',[
			'attributes'=>[
				'disabled'=>[
					'default'=>$arg,
					'type'=>'string'
				],
				'data'=>[
					'default'=>$data,
					'type'=>'object'
				]
			]
		] );
	}		
}

add_action('cli_init','cli_init');
add_action( 'init', 'create_block_customblock_block_init' );
