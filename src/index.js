<?php
/**
 * Shoptimizer child theme functions
 *
 * @package shoptimizer
 */

/**
 * Loads parent and child theme scripts.
 */

function shoptimizer_child_enqueue_scripts() {
    $parent_style    = 'shoptimizer-style';
    $parent_base_dir = 'shoptimizer';
    wp_enqueue_style( $parent_style, get_template_directory_uri() . '/style.css', array(), wp_get_theme( $parent_base_dir ) ? wp_get_theme( $parent_base_dir )->get( 'Version' ) : '' );

    if ( is_rtl() ) {
        wp_enqueue_style( 'shoptimizer-rtl', get_template_directory_uri() . '/rtl.css', array(), wp_get_theme( $parent_base_dir ) ? wp_get_theme( $parent_base_dir )->get( 'Version' ) : '' );
    }

    wp_enqueue_style( 'shoptimizer-child-style', get_stylesheet_directory_uri() . '/style.css', array( $parent_style ), wp_get_theme()->get( 'Version' ) );
}

add_action( 'wp_enqueue_scripts', 'shoptimizer_child_enqueue_scripts' );


/**
 * Change a currency symbol
 */
add_filter('woocommerce_currency_symbol', 'change_existing_currency_symbol', 10, 2);

function change_existing_currency_symbol( $currency_symbol, $currency ) {
     switch( $currency ) {
          case 'CAD': $currency_symbol = 'CAD$'; break;
     }
     return $currency_symbol;
}

// redirect to home page after logout
add_action('wp_logout','go_home');
function go_home(){
  wp_redirect( home_url() );
  exit();
}


 /* this a code created for adding prefix and suffix to our order number*/
add_filter( 'woocommerce_order_number', 'change_woocommerce_order_number' );

function change_woocommerce_order_number( $order_id ) {
    $current_date = date('jmy');
    $prefix = 'TWR';
    $order = wc_get_order( $order_id );
    $order_date = $order->get_date_created();
    $date_created = $order_date->date( 'ymd' );
    $currency = $order->get_currency();
    if ( $currency === 'USD' ) {
        $prefix = 'TWRUC';
   }
    $new_order_id = $prefix .$date_created."-".$order_id;
    return $new_order_id;
}

/*Move star rating position on single product pages */
add_action( 'after_setup_theme', 'cg_original_pdp_rating_position', 50 );
function cg_original_pdp_rating_position() {
add_action( 'woocommerce_single_product_summary', 'woocommerce_template_single_rating', 6 );
remove_action( 'woocommerce_single_product_summary', 'woocommerce_template_single_rating', 20 );
}

/*Move product SKU under the Add to cart button*/
add_action( 'wp', 'shoptimizer_reorder_product_meta', 99 );
function shoptimizer_reorder_product_meta() {
add_action( 'woocommerce_after_add_to_cart_button', 'woocommerce_template_single_meta', 15 );
remove_action( 'woocommerce_after_single_product_summary', 'woocommerce_template_single_meta', 15 );
}


/**************************************
 * Custom text on the thank you page.
 **************************************/
function isa_order_received_text( $text, $order ) {
    return '<h2>Thank you for your order.  It has been received. </h2> We appreciate your business and will get your items carefully packed and shipped to you next business day.<hr>
<ul>
<li>An order confirmation email has been sent.  If you <font style="color: red">have not received </font> this email within 1 hour of purchasing your product, please check your<font style="color: red"> "Bulk/Junk/Spam Mail" folder </font> to ensure the email did not get flagged.</li>  

<li>We will send your another email later once we process your order and ship it out.</li>
<li>If you have any question about the order, check our <a href="/frequently-asked-questions/">Frequently Asked Questions</a> page first. </li>
</ul><hr>';
}
add_filter('woocommerce_thankyou_order_received_text', 'isa_order_received_text', 10, 2 );

/**************************************
 * End of Custom text on the thank you page.
 **************************************/

/**
 * @snippet       Display $0.00 Amount For Free Shipping Rates @ WooCommerce Cart & Checkout
 */
 
add_filter( 'woocommerce_cart_shipping_method_full_label', 'add_0_to_shipping_label', 10, 2 );
   
function add_0_to_shipping_label( $label, $method ) {
 
// if shipping rate is 0, concatenate ": $0.00" to the label
if ( ! ( $method->cost > 0 ) ) {
$label .= ': ' . wc_price(0);
} 
 // return original or edited shipping label
return $label;
 
}

// Auto uncheck "Ship to a different address"
add_filter( 'woocommerce_ship_to_different_address_checked', '__return_false' );

// Display the sku below cart item name
add_filter( 'woocommerce_cart_item_name', 'display_sku_after_item_name', 5, 3 );
function display_sku_after_item_name( $item_name, $cart_item, $cart_item_key ) {
    $product = $cart_item['data']; // The WC_Product Object

    if( is_cart() && $product->get_sku() ) {
        $item_name .= '<br><span class="item-sku">(SKU:&nbsp; '. $product->get_sku() . ')</span>';
    }
    return $item_name;
}

// Display the sku below under cart item name in checkout
add_filter( 'woocommerce_checkout_cart_item_quantity', 'display_sku_after_item_qty', 5, 3 );  
function display_sku_after_item_qty( $item_quantity, $cart_item, $cart_item_key ) {
    $product = $cart_item['data']; // The WC_Product Object

    if( $product->get_sku() ) {
        $item_quantity .= '<br><span class="item-sku">SKU: '. $product->get_sku() . '</span>';
    }
    return $item_quantity;
}

//unset_shippingmethod_base_on_shippingclass - added by Cindy - Jan 20, 2022
//add pickup at your daycare method when daycare coupon code applied - added by Cindy -  Nov 10, 2022
add_filter( 'woocommerce_package_rates', 'unset_shippingmethod_base_on_shippingclass', 10, 2 );
   
function unset_shippingmethod_base_on_shippingclass ( $rates, $package ) {
      
    //$class5=109;
    $class5=1030;
    $allclass5 = true;

    $daycare=false; 
    $coupons = WC()->cart->get_coupons();
    // Loop each coupon
    foreach($coupons as $coupon_code) {
           $coupon = new WC_Coupon( $coupon_code);
           $msg = $coupon->get_description();
           if (str_contains(strtoupper($msg), 'DAYCARE')) {
               $daycare=true; 
          }
     }
      
     if (!$daycare) {
    // unset daycare pickup
    unset( $rates['local_pickup:21'] );
    unset( $rates['local_pickup:22'] ); 
     }

// Only unset rates if free_shipping is available
if ( isset( $rates['free_shipping:1'] ) ) {
     unset( $rates['flat_rate:5'] );
     unset( $rates['flat_rate:15'] );
     $allclass5 = false;
}elseif( isset( $rates['free_shipping:7'] ) ) {
     unset( $rates['flat_rate:16'] );
     unset( $rates['flat_rate:9'] );
            $allclass5 = false;
} else{
 // HERE define your shipping class to find
    $class1 = 508;  //Package L1
    $class2 = 110;  //package L2
    $class3 = 532;  //package L3
    $class4 = 533;  // package L4
    $method_key_ids = array('flat_rate:15','flat_rate:16');  // hide regular mail method


    // Checking in cart items
    foreach( $package['contents'] as $item ){
        // If we find the shipping class
        if(( $item['data']->get_shipping_class_id() == $class1 ) || ( $item['data']->get_shipping_class_id() == $class2 ) || ( $item['data']->get_shipping_class_id() == $class3 ) || ( $item['data']->get_shipping_class_id() == $class4 )){ 
            foreach( $method_key_ids as $method_key_id ){
                unset($rates[$method_key_id]); // Remove the targeted methods -hide regular mail method
            }
            $allclass5=false;
            break; // Stop the loop
        }
    }
}    
if ($allclass5 == true){
    $method_key_ids2=array('flat_rate:5','flat_rate:9');   // hide parcel with tracking method
     foreach( $method_key_ids2 as $method_key_id2 ){
           //     unset($rates[$method_key_id2]); // Remove the targeted methods - hide parcel with tracking method
     }
}
    
return $rates;
  
}




//display price and sales price on cart page
add_filter( 'woocommerce_cart_item_price', 'cg_cart_table_price_display', 30, 3 );
  
function cg_cart_table_price_display( $price, $values, $cart_item_key ) {
   $slashed_price = $values['data']->get_price_html();
   $is_on_sale = $values['data']->is_on_sale();
   if ( $is_on_sale ) {
      $price = $slashed_price;
   }
   return $price;
}

//Insist customer to create an account - added by DX 06/15/22
add_filter('woocommerce_create_account_default_checked', '__return_true');

//set stripe cc as default payment - added on June 21, 2022 by Cindy
add_action( 'template_redirect', 'define_default_payment_gateway' );
function define_default_payment_gateway(){
    if( is_checkout() && ! is_wc_endpoint_url() ) {
        // HERE define the default payment gateway ID
        $default_payment_id = 'stripe';

        WC()->session->set( 'chosen_payment_method', $default_payment_id );
    }
}


//override checkout page address 2 placeholder - added on Aug 10, 2022 by Cindy
add_filter( 'woocommerce_default_address_fields' , 'rename_address_placeholders_checkout', 9999 );
function rename_address_placeholders_checkout( $address_fields ) {
    $address_fields['address_1']['label'] = 'Address';
    $address_fields['address_1']['placeholder'] = 'Street address';
    $address_fields['address_2']['placeholder'] = 'Appt, Unit, PO Box';
    return $address_fields;
}

//Add custom header to category page - added by DX 10/18/2022
add_action( 'after_setup_theme', 'shoptimizer_remove_archive_titles', 99 );
function shoptimizer_remove_archive_titles() {
    remove_action( 'woocommerce_before_main_content', 'shoptimizer_archives_title', 20 );
}

add_action( 'woocommerce_before_main_content', 'shoptimizer_custom_product_category_title', 99 );
function shoptimizer_custom_product_category_title() { 
    $term = get_queried_object();
    $category_title = get_field('product_category_title', $term);
    if ( ! empty( $category_title ) ) {
        echo '<h1 class="woocommerce-products-header__title page-title">';
        echo shoptimizer_safe_html( $category_title );
        echo '</h1>';
    }
}
    
//Infinite scroll added by Dx 04/11/23

add_filter( 'post_class', 'filter_product_post_class', 10, 3 );
function filter_product_post_class( $classes, $class, $product_id ){
if( in_the_loop() )
$classes[] = 'mainproduct';
return $classes;
}

//Change Country By URL added by DX 04/11/23

add_action('before_woocommerce_init', function() {
  // Only change the country on the frontend
  if(!is_admin() || defined('DOING_AJAX')) {
    // If a country was selected via a GET argument, pass it through the POST
    // data. This will make it look as if the visitor selected the country using
    // the widget
    if(isset($_GET['aelia_customer_country'])) {
      $_POST['aelia_customer_country'] = strtoupper($_GET['aelia_customer_country']);
    }
  }
}, 0);

    //sms and newsletter checkbox -added by Kiran 25/10/22
function sms_checkbox() {
    ?>
         <script>
          const news_letter = document.getElementById('kl_newsletter_checkbox');
          const sms = document.getElementById('kl_sms_consent_checkbox');
             news_letter.checked = true;
          sms.checked = true;
        </script>
    <?php
}
add_action('wp_footer', 'sms_checkbox');

add_action('woocommerce_reset_password_notification', 'password_reset_action', 10, 2);
function password_reset_action($user_login, $key) {
    $user = get_user_by( 'login', $user_login );
    $email = $user->data->user_email;
    $user_id = $user->data->ID;

    $public_api_key = "USsaAM";//WCK()->options->get_klaviyo_option( 'klaviyo_public_api_key' );
    
    $reset_link = add_query_arg( array( 'key' => $key, 'id' => $user_id ), wc_get_endpoint_url( 'lost-password', '', wc_get_page_permalink( 'myaccount' ) ) );

    $evt_data = array(
        'token' => $public_api_key,
        'event' => 'Woocommerce Reset Password',
        'customer_properties' => array(
            '$email' => $email
        ),
        'properties' => array(
            '$event_id'=> "8001" . date('ymdHis'),
            'UserName' => $user_login,
            'DisplayName' => $user->data->display_name,
            'PasswordResetLink' => $reset_link
        ),
        "time" => time()
    );
    $base64_encoded = base64_encode(json_encode($evt_data));
    $url = "https://a.klaviyo.com/api/track?data=" . $base64_encoded;

    $result = wp_remote_get($url);
}

add_action('woocommerce_created_customer', 'new_account_action', 10, 3);
function new_account_action( $customer_id, $new_customer_data, $password_generated ) {
    $user = get_user_by( 'id', $customer_id );
    $email = $user->data->user_email;
    $user_login = $user->data->user_login;
    
    $user_password = $new_customer_data['user_pass'];

    $public_api_key = "USsaAM";//WCK()->options->get_klaviyo_option( 'klaviyo_public_api_key' );

    $evt_data = array(
        'token' => $public_api_key,
        'event' => 'Woocommerce New Account',
        'customer_properties' => array(
            '$email' => $email
        ),
        'properties' => array(
            '$event_id'=> "8002" . date('ymdHis'),
            'UserName' => $user_login,
            'DisplayName' => $user->data->display_name,
            'UserPWD' => $user_password,
            'MyaccountUrl' => get_permalink( get_option('woocommerce_myaccount_page_id') )
        ),
        "time" => time()
    );
    $base64_encoded = base64_encode(json_encode($evt_data));
    $url = "https://a.klaviyo.com/api/track?data=" . $base64_encoded;
    
    $result = wp_remote_get($url);

}

add_action( 'woocommerce_order_status_failed', 'order_failed_klaviyo_action', 10, 2);
function order_failed_klaviyo_action( $order_id, $order ) {
    $public_api_key = "USsaAM";//WCK()->options->get_klaviyo_option( 'klaviyo_public_api_key' );
    
    $customer_id = $order->get_customer_id();
    
    $user = get_user_by( 'id', $customer_id );
    $email = $user->data->user_email;
    $user_login = $user->data->user_login;
    
    $items = array();
    $total_quantity = 0;
    
    foreach ( $order->get_items() as $item_id => $item ) {
        $sub_item = array();
        $product       = $item->get_product();
        $parent_product_id = $product->get_parent_id();

        if ($product->get_parent_id() == 0 ) {
            $parent_product_id = $product->get_id();
        }

        $image = wp_get_attachment_url(get_post_thumbnail_id($product->get_id()));

        if ($image == false) {
            $image = wp_get_attachment_url(get_post_thumbnail_id($parent_product_id));
        }

        $sub_item['Quantity'] = $item->get_quantity();
        $sub_item['ProductID'] = $parent_product_id;
        $sub_item['VariantID'] = $product->get_id();
        $sub_item['Name'] = $product->get_name();
        $sub_item['URL'] = $product->get_permalink();
        $sub_item['Image'] = $image;
        $sub_item['LineTotal'] = $order->get_line_total( $item );
        $sub_item['SubTotal'] = $order->get_line_subtotal( $item );
        $sub_item['Tax'] =  $order->get_line_tax( $item );
        $sub_item['AllMeta'] = $item->get_meta_data();
        $items[] = $sub_item;

        $total_quantity = $total_quantity + $item->get_quantity();
    }
    

    $evt_data = array(
        'token' => $public_api_key,
        'event' => 'Woocommerce Order Failed',
        'customer_properties' => array(
            '$email' => $email
        ),
        'properties' => array(
            '$event_id'=> "8003" . $order_id,
            'CurrencySymbol' => get_woocommerce_currency_symbol(),
            'Currency' => get_woocommerce_currency(),
            'OrderId'  => $order_id,
            'UserName' => $user_login,
            'DisplayName' => $user->data->display_name,
            '$value'    => $order->get_total(),
            'Quantity'  => $total_quantity,
            'MyaccountUrl' => get_permalink( get_option('woocommerce_myaccount_page_id') ),
            'Items'     => $items,
            'CheckoutUrl' => $order->get_checkout_payment_url()
        ),
        "time" => time()
    );
    $base64_encoded = base64_encode(json_encode($evt_data));
    $url = "https://a.klaviyo.com/api/track?data=" . $base64_encoded;

    $result = wp_remote_get($url);
}

add_action('woocommerce_order_partially_refunded', 'order_partially_refunded_klaviyo_action', 10, 2);
function order_partially_refunded_klaviyo_action( $order_id, $refund_id ) {
    $public_api_key = "USsaAM";//WCK()->options->get_klaviyo_option( 'klaviyo_public_api_key' );
    
    $order = new WC_Order( $order_id );
    $refund = new WC_Order_Refund( $refund_id );
    
    $customer_id = $order->get_customer_id();
    
    $user = get_user_by( 'id', $customer_id );
    $email = $user->data->user_email;
    $user_login = $user->data->user_login;
    
    $order_items = array();
    $total_quantity = 0;
    $refunded_quantity = 0;
    
    foreach ( $order->get_items() as $item_id => $item ) {
        $sub_item = array();
        $product       = $item->get_product();
        $parent_product_id = $product->get_parent_id();

        if ($product->get_parent_id() == 0 ) {
            $parent_product_id = $product->get_id();
        }

        $image = wp_get_attachment_url(get_post_thumbnail_id($product->get_id()));

        if ($image == false) {
            $image = wp_get_attachment_url(get_post_thumbnail_id($parent_product_id));
        }

        $sub_item['Quantity'] = $item->get_quantity();
        $sub_item['ProductID'] = $parent_product_id;
        $sub_item['VariantID'] = $product->get_id();
        $sub_item['Name'] = $product->get_name();
        $sub_item['URL'] = $product->get_permalink();
        $sub_item['Image'] = $image;
        $sub_item['LineTotal'] = $order->get_line_total( $item );
        $sub_item['SubTotal'] = $order->get_line_subtotal( $item );
        $sub_item['Tax'] =  $order->get_line_tax( $item );
        $sub_item['AllMeta'] = $item->get_meta_data();
        $order_items[] = $sub_item;
        $total_quantity = $total_quantity + $item->get_quantity();
    }
    
    $refund_items = array();
    
    foreach ( $refund->get_items() as $item_id => $item ) {
        $sub_item = array();
        $product       = $item->get_product();
        $parent_product_id = $product->get_parent_id();

        if ($product->get_parent_id() == 0 ) {
            $parent_product_id = $product->get_id();
        }

        $image = wp_get_attachment_url(get_post_thumbnail_id($product->get_id()));

        if ($image == false) {
            $image = wp_get_attachment_url(get_post_thumbnail_id($parent_product_id));
        }

        $sub_item['Quantity'] = $item->get_quantity();
        $sub_item['ProductID'] = $parent_product_id;
        $sub_item['VariantID'] = $product->get_id();
        $sub_item['Name'] = $product->get_name();
        $sub_item['URL'] = $product->get_permalink();
        $sub_item['Image'] = $image;
        $sub_item['LineTotal'] = $order->get_line_total( $item );
        $sub_item['SubTotal'] = $order->get_line_subtotal( $item );
        $sub_item['Tax'] =  $order->get_line_tax( $item );
        $sub_item['AllMeta'] = $item->get_meta_data();
        $refund_items[] = $sub_item;
        $refunded_quantity = $refunded_quantity + $item->get_quantity();
    }
        
    

    $evt_data = array(
        'token' => $public_api_key,
        'event' => 'Woocommerce Order Partially Refunded',
        'customer_properties' => array(
            '$email' => $email
        ),
        'properties' => array(
            '$event_id'=> "8004" . $order_id,
            'CurrencySymbol' => get_woocommerce_currency_symbol(),
            'Currency' => get_woocommerce_currency(),
            'OrderId'  => $order_id,
            'UserName' => $user_login,
            'DisplayName' => $user->data->display_name,
            '$value'    => $order->get_total(),
            'Quantity'  => $total_quantity,
            'RefundedQuantity' => $refunded_quantity,
            'MyaccountUrl' => get_permalink( get_option('woocommerce_myaccount_page_id') ),
            'Items'     => $order_items,
            'RefundItems'   => $refund_items,
        ),
        "time" => time()
    );
    $base64_encoded = base64_encode(json_encode($evt_data));
    $url = "https://a.klaviyo.com/api/track?data=" . $base64_encoded;

    $result = wp_remote_get($url);
}

add_action('woocommerce_order_fully_refunded', 'order_fully_refunded_klaviyo_action', 10, 2);
function order_fully_refunded_klaviyo_action( $order_id, $refund_id ) {
    $public_api_key = "USsaAM";//WCK()->options->get_klaviyo_option( 'klaviyo_public_api_key' );
    
    $order = new WC_Order( $order_id );
    $refund = new WC_Order_Refund( $refund_id );
    
    $customer_id = $order->get_customer_id();
    
    $user = get_user_by( 'id', $customer_id );
    $email = $user->data->user_email;
    $user_login = $user->data->user_login;
    
    $order_items = array();
    $total_quantity = 0;
    $refunded_quantity = 0;
    
    foreach ( $order->get_items() as $item_id => $item ) {
        $sub_item = array();
        $product       = $item->get_product();
        $parent_product_id = $product->get_parent_id();

        if ($product->get_parent_id() == 0 ) {
            $parent_product_id = $product->get_id();
        }

        $image = wp_get_attachment_url(get_post_thumbnail_id($product->get_id()));

        if ($image == false) {
            $image = wp_get_attachment_url(get_post_thumbnail_id($parent_product_id));
        }

        $sub_item['Quantity'] = $item->get_quantity();
        $sub_item['ProductID'] = $parent_product_id;
        $sub_item['VariantID'] = $product->get_id();
        $sub_item['Name'] = $product->get_name();
        $sub_item['URL'] = $product->get_permalink();
        $sub_item['Image'] = $image;
        $sub_item['LineTotal'] = $order->get_line_total( $item );
        $sub_item['SubTotal'] = $order->get_line_subtotal( $item );
        $sub_item['Tax'] =  $order->get_line_tax( $item );
        $sub_item['AllMeta'] = $item->get_meta_data();
        $order_items[] = $sub_item;
        $total_quantity = $total_quantity + $item->get_quantity();
    }
    
    $refund_items = array();
    
    foreach ( $refund->get_items() as $item_id => $item ) {
        $sub_item = array();
        $product       = $item->get_product();
        $parent_product_id = $product->get_parent_id();

        if ($product->get_parent_id() == 0 ) {
            $parent_product_id = $product->get_id();
        }

        $image = wp_get_attachment_url(get_post_thumbnail_id($product->get_id()));

        if ($image == false) {
            $image = wp_get_attachment_url(get_post_thumbnail_id($parent_product_id));
        }

        $sub_item['Quantity'] = $item->get_quantity();
        $sub_item['ProductID'] = $parent_product_id;
        $sub_item['VariantID'] = $product->get_id();
        $sub_item['Name'] = $product->get_name();
        $sub_item['URL'] = $product->get_permalink();
        $sub_item['Image'] = $image;
        $sub_item['LineTotal'] = $order->get_line_total( $item );
        $sub_item['SubTotal'] = $order->get_line_subtotal( $item );
        $sub_item['Tax'] =  $order->get_line_tax( $item );
        $sub_item['AllMeta'] = $item->get_meta_data();
        $refund_items[] = $sub_item;
        $refunded_quantity = $refunded_quantity + $item->get_quantity();
    }
        
    

    $evt_data = array(
        'token' => $public_api_key,
        'event' => 'Woocommerce Order Fully Refunded',
        'customer_properties' => array(
            '$email' => $email
        ),
        'properties' => array(
            '$event_id'=> "8005" . $order_id,
            'CurrencySymbol' => get_woocommerce_currency_symbol(),
            'Currency' => get_woocommerce_currency(),
            'OrderId'  => $order_id,
            'UserName' => $user_login,
            'DisplayName' => $user->data->display_name,
            '$value'    => $order->get_total(),
            'Quantity'  => $total_quantity,
            'RefundedQuantity' => $refunded_quantity,
            'MyaccountUrl' => get_permalink( get_option('woocommerce_myaccount_page_id') ),
            'Items'     => $order_items,
            'RefundItems'   => $refund_items,
        ),
        "time" => time()
    );
        
    $base64_encoded = base64_encode(json_encode($evt_data));
    $url = "https://a.klaviyo.com/api/track?data=" . $base64_encoded;

    $result = wp_remote_get($url);
}

add_action('woocommerce_payment_complete', 'new_order_created_klaviyo', 10, 1);
function new_order_created_klaviyo( $order_id ){

    $public_api_key = "USsaAM";//WCK()->options->get_klaviyo_option( 'klaviyo_public_api_key' );
    
    $order = wc_get_order( $order_id );
    
    $customer_id = $order->get_customer_id();
    
    if ( $customer_id ) {
        $user = get_user_by( 'id', $customer_id );
        $email = $user->data->user_email;
        $user_login = $user->data->user_login;
        $display_name = $user->data->display_name;
    } else {
        $billing_first_name = $order->get_billing_first_name();
        $billing_last_name  = $order->get_billing_last_name();
        $email  = $order->get_billing_email();
        $display_name = $billing_first_name . " " . $billing_last_name;
        $user_login = $display_name;
    }
    
    
    
    $items = array();
    $total_quantity = 0;

    $attr = array();
    if ($taxonomies = get_taxonomies(false, 'objects')) {
        foreach ($taxonomies as $taxonomy) {
            if (substr($taxonomy->name, 0, 3) == 'pa_') {
                $attr[$taxonomy->name] = $taxonomy->label;
            }
        }
    }

    $total_discount = $order->get_total_discount();
    
    $isDiscounted = false;

    if ( $total_discount > 0 ) {
        $isDiscounted = true;
    }

    $all_cats = array();

    $itemNames = array();
    $productNames = array();
    
    foreach ( $order->get_items() as $item_id => $item ) {
        $sub_item = array();
        $product       = $item->get_product();
        $parent_product_id = $product->get_parent_id();

        if ($product->get_parent_id() == 0 ) {
            $parent_product_id = $product->get_id();
        }

        $image = wp_get_attachment_url(get_post_thumbnail_id($product->get_id()));

        if ($image == false) {
            $image = wp_get_attachment_url(get_post_thumbnail_id($parent_product_id));
        }

        if ( $parent_product_id == $product->get_id() ) {
            $parent_product = $product;
        } else {
            $parent_product = wc_get_product( $parent_product_id );
        }

        $itemNames[] = $product->get_name();
        $productNames[] = $parent_product->get_name();

        $sub_item['Quantity'] = $item->get_quantity();
        $sub_item['ProductID'] = $parent_product_id;
        $sub_item['VariantID'] = $product->get_id();
        $sub_item['Name'] = $product->get_name();
        $sub_item['URL'] = $product->get_permalink();
        $sub_item['Image'] = $image;
        $sub_item['LineTotal'] = $order->get_line_total( $item );
        $sub_item['SubTotal'] = $order->get_line_subtotal( $item );
        $sub_item['Tax'] =  $order->get_line_tax( $item );
        $sub_item['AllMeta'] = $item->get_meta_data();
        $sub_item['Attributes'] = array();

        $total_quantity = $total_quantity + $item->get_quantity();

        foreach ( $attr as $tax_name => $tax_label ) {
            $tax_terms = wp_get_object_terms( $parent_product_id,  $tax_name );
            if ( !empty( $tax_terms ) ) {
                $sub_item['Attributes'][$tax_label] = array();
                foreach( $tax_terms as $term ) {
                    $sub_item['Attributes'][$tax_label][] = $term->name;
                }
            }
        }

        $categories = array();

        $cats = get_the_terms( $parent_product_id, 'product_cat' );
        foreach ($cats as $cat) {
            $categories[] = $cat->name;

            if ( !isset( $all_cats[$cat->term_id] ) ) {
                $all_cats[$cat->term_id] = $cat->name;
            }
        }

        $sub_item['Categories'] = $categories;

        $items[] = $sub_item;
    }

    $gift_cards = array();
    $pw_gift_card_obj = $order->get_items('pw_gift_card');
    
    if ( !empty( $pw_gift_card_obj ) ) {
        foreach( $pw_gift_card_obj as $order_item_id => $line ) {
            $gift_cards[] = array(
                'number' => $line->get_card_number(),
                'amount' => $line->get_amount(),
            );
        }
    }

    $shipping_data = array();

    if ( $order->get_items( 'shipping' ) ) {
        foreach( $order->get_items( 'shipping' ) as $item_id => $item ){
            // Get the data in an unprotected array
            $shipping_data[] = array(
                'name' => $item->get_name(),
                'total' => $item->get_total()
            );
        }
    }

    $tax_data = array();
    $total_tax_amount = 0;  
    foreach ( $order->get_tax_totals() as $code => $tax_total ) {
        $tax_label      = $tax_total->label;
        $tax_data[] = array(
            'Label' => $tax_label,
            'Total' => wc_price( wc_round_tax_total( $tax_total->amount ), array( 'currency' => $order->get_currency() ) )
        );

        $total_tax_amount = $total_tax_amount + $tax_total->amount;
    }

    $total_tax_amount = number_format( $total_tax_amount, 2);
    
    $coupons = array();

    if ( $order->get_coupon_codes() ) {
        foreach( $order->get_coupon_codes() as $code ) {
            // Get the WC_Coupon object
            $coupon = new WC_Coupon($code);
        
            $coupons[] = array(
                'Amount' => $coupon->get_amount(),
                'Code'  => $code
            );
        }
    }

    $usedCoupon = false;

    if ( !empty( $coupons ) ) {
        $usedCoupon = true;
    }

    $evt_data = array(
        'token' => $public_api_key,
        'event' => 'Woocommerce Placed Order(Custom)',
        'customer_properties' => array(
            '$email' => $email
        ),
        'properties' => array(
            '$event_id'=> "8006" . $order_id,
            'CurrencySymbol' => get_woocommerce_currency_symbol(),
            'Currency' => get_woocommerce_currency(),
            'OrderId'  => $order_id,
            'OrderNumber' => $order->get_order_number(),
            'OrderDate' => wc_format_datetime( $order->get_date_created() ),
            'UserName' => $user_login,
            'DisplayName' => $display_name,
            '$value'    => $order->get_total(),
            'SubTotal'  => $order->get_subtotal(),
            'Quantity'  => $total_quantity,
            'MyaccountUrl' => get_permalink( get_option('woocommerce_myaccount_page_id') ),
            'Items'     => $items,
            'TaxData'   => $tax_data,
            'TaxTotal'  => $total_tax_amount,
            'Shipping'  => $shipping_data,
            'ShippingAddress' => $order->get_address( 'shipping' ),
            'BillingAddress' => $order->get_address( 'billing' ),
            'GiftCard'  => $gift_cards,
            'Coupons'   => $coupons,
            'Categories' => array_values( $all_cats ),
            'IsDiscounted'  => $isDiscounted,
            'ItemNames' => $itemNames,
            'ProductNames'  => $productNames,
            'UsedCoupon'    => $usedCoupon,
            'CouponDiscount' => $order->get_total_discount()
        ),
        "time" => time()
    );
    $base64_encoded = base64_encode(json_encode($evt_data));
    $url = "https://a.klaviyo.com/api/track?data=" . $base64_encoded;

    $result = wp_remote_get($url);
    
    
}

add_action( 'pw_gift_cards_send_email_manually', 'new_pw_gift_card_klaviyo', 10, 7 );
function new_pw_gift_card_klaviyo( $gift_card_number, $recipient, $from, $recipient_name, $message, $amount, $expiration_date ) {
    
    $public_api_key = "USsaAM";//WCK()->options->get_klaviyo_option( 'klaviyo_public_api_key' );
    
    if ( !empty( $gift_card_number ) && !empty( $recipient ) ) {
        $evt_data = array(
            'token' => $public_api_key,
            'event' => 'Woocommerce New PW Gift Card',
            'customer_properties' => array(
                '$email' => $recipient
            ),
            'properties' => array(
                '$event_id'=> "8007" . date('ymdHis'),
                'CardNumber' => $gift_card_number,
                'From' => $from,
                'RecipientName' => $recipient_name,
                'Message' => $message,
                'Amount' => $amount,
                'ExpirationDate' => $expiration_date
            ),
            "time" => time()
        );
        $base64_encoded = base64_encode(json_encode($evt_data));
        $url = "https://a.klaviyo.com/api/track?data=" . $base64_encoded;

        $result = wp_remote_get($url);
    }
}

add_action('shoptimizer_header', 'add_language_selector', 50);
function add_language_selector() {
?>
    <!-- <div class="mobile_lang_selector flag">
        <img class="img" src="<?php echo site_url('wp-content/uploads/canadaflag.png');?>" class="no-lazyload">
        <div class="lang_dropdown">
            <span class="ca_flag flag_selector"><img src="<?php echo site_url('wp-content/uploads/canadaflag.png');?>" class="no-lazyload"></span>
            <span class="us_flag flag_selector" style="margin-top: 10px"><img src="<?php echo site_url('wp-content/uploads/usflag1.png');?>" class="no-lazyload"></span>
        </div>
    </div> -->
<script>
    jQuery('.mobile_lang_selector').click(function(){
        jQuery(this).toggleClass('open');
    });
    jQuery('.flag_selector').click(function(){
        jQuery('.flag .img').attr('src', jQuery(this).find('img').eq(0).attr('src'));
    });

</script>


<?php
}

//Breadcrumbs edit by dx 02/28/23
add_filter( 'wpseo_breadcrumb_links' ,'wpseo_remove_breadcrumb_link', 10 );

function wpseo_remove_breadcrumb_link( $links ){
    // Remove all breadcrumbs that have the text: All Products.
    $new_links = array_filter( $links, function ( $link ) { return $link['text'] !== 'All Products'; } );
 
    // Reset array keys.
    return array_values( $new_links );
}


add_action('pw_gift_cards_pending_email_notification', 'theme_gift_cards_pending_email_notification', 20, 1);
function theme_gift_cards_pending_email_notification( $order_id ) {

    $public_api_key = "USsaAM";//WCK()->options->get_klaviyo_option( 'klaviyo_public_api_key' );

    $is_pending_order = get_post_meta( $order_id, PWGC_DELIVERY_PENDING_META_KEY, true );

    if ( empty( $is_pending_order ) ) {
        $order = new WC_Order( $order_id );
        foreach ( $order->get_items( 'line_item' ) as $order_item_id => $order_item ) {
            if ( ! is_a( $order_item->get_product(), 'WC_Product' ) ) {
                continue;
            }

            $product_id = !empty( $order_item->get_product()->get_parent_id() ) ? $order_item->get_product()->get_parent_id() : $order_item->get_product()->get_id();
            $product =  wc_get_product( $product_id );
            if ( is_a( $product, 'WC_Product_PW_Gift_Card' ) ) {

                $gift_card_numbers = wc_get_order_item_meta( $order_item_id, PWGC_GIFT_CARD_NUMBER_META_KEY, false );
                $bonus_recipient = wc_get_order_item_meta( $order_item_id, PWGC_BONUS_RECIPIENT_META_KEY, true );
                $pwgc_to = wc_get_order_item_meta( $order_item_id, PWGC_TO_META_KEY );

                // If there isn't a "To" email address, default to the purchasing customer's email.
                if ( empty( $pwgc_to ) ) {
                    $pwgc_to = $order->get_billing_email();
                }

                $sender_email = $order->get_billing_email();

                if ( !empty( $pwgc_to ) ) {
                    $recipients = preg_split('/[\s,]+/', $pwgc_to, PWGC_RECIPIENT_LIMIT, PREG_SPLIT_NO_EMPTY);
                }

                if ( isset( $recipients ) && !empty( $recipients ) ) {
                    $recipient = $recipients[0];
                } else {
                    $recipient = get_option( 'admin_email' );
                }

                foreach ( $gift_card_numbers as $gift_card_number ) {
                    $amount = wc_get_order_item_meta( $order_item_id, PWGC_AMOUNT_META_KEY );

                    if ( !$product->get_pwgc_is_physical_card() ) {
                        $gift_card = new PW_Gift_Card( $gift_card_number );

                        if ( $gift_card->get_active() == false ) {
                            continue;
                        }

                        if ( isset( $recipients ) && !empty( $recipients ) ) {
                            // Get the next email address from the list, or continue sending to the last (or default) address.
                            $recipient = trim( array_shift( $recipients ) );
                        }

                        if ( !empty( $gift_card_number ) && !empty( $recipient ) ) {

                            $from = $gift_card->get_from();
                            if ( $from == '' ) {
                                $from = $order->get_billing_first_name() . ' ' . $order->get_billing_last_name();
                            }
                            $evt_data = array(
                                'token' => $public_api_key,
                                'event' => 'Woocommerce New PW Gift Card - Checkout',
                                'customer_properties' => array(
                                    '$email' => $recipient
                                ),
                                'properties' => array(
                                    '$event_id'=> "8008" . date('ymdHis'),
                                    'CardNumber' => $gift_card_number,
                                    'From' => $from,
                                    'RecipientName' => $gift_card->get_recipient_name(),
                                    'Message' => $gift_card->get_message(),
                                    'Amount' => $amount,
                                    'ExpirationDate' => $gift_card->get_expiration_date()
                                ),
                                "time" => time()
                            );
                            $base64_encoded = base64_encode(json_encode($evt_data));
                            $url = "https://a.klaviyo.com/api/track?data=" . $base64_encoded;
                    
                            $result = wp_remote_get($url);

                            if ( $recipient != $sender_email ) {

                                $evt_data = array(
                                    'token' => $public_api_key,
                                    'event' => 'Woocommerce New PW Gift Card - Checkout(Sender)',
                                    'customer_properties' => array(
                                        '$email' => $sender_email
                                    ),
                                    'properties' => array(
                                        '$event_id'=> "8009" . date('ymdHis'),
                                        'CardNumber' => $gift_card_number,
                                        'From' => $from,
                                        'RecipientName' => $gift_card->get_recipient_name(),
                                        'RecipientEmail' => $recipient,
                                        'Message' => $gift_card->get_message(),
                                        'Amount' => $amount,
                                        'ExpirationDate' => $gift_card->get_expiration_date()
                                    ),
                                    "time" => time()
                                );
                                $base64_encoded = base64_encode(json_encode($evt_data));
                                $url = "https://a.klaviyo.com/api/track?data=" . $base64_encoded;
                        
                                $result = wp_remote_get($url);
                            }
                        }
                    }
                }
            }
        }
    }
}

add_action( 'elementor_pro/forms/new_record', 'return_exchange_notification_klaviyo', 10, 2 );
function return_exchange_notification_klaviyo( $record, $handler ) {

    $form_name = $record->get_form_settings( 'form_name' );

    // Replace MY_FORM_NAME with the name you gave your form
    if ( 'Returns & Exchanges Form' !== $form_name &&  'Contact Us' !== $form_name ) {
        return;
    }

    $recipient = $record->get_form_settings( 'email_to' );

    $public_api_key = "USsaAM";//WCK()->options->get_klaviyo_option( 'klaviyo_public_api_key' );

    if ( 'Returns & Exchanges Form' === $form_name ) {
        $evt_data = array(
            'token' => $public_api_key,
            'event' => 'Return & Exchanges Form Notification',
            'customer_properties' => array(
                '$email' => $recipient
            ),
            'properties' => array(
                '$event_id'=> "8010" . date('ymdHis'),
            ),
            "time" => time()
        );
    } else {
        $evt_data = array(
            'token' => $public_api_key,
            'event' => 'Contact Us Form Submission',
            'customer_properties' => array(
                '$email' => $recipient
            ),
            'properties' => array(
                '$event_id'=> "8011" . date('ymdHis'),
            ),
            "time" => time()
        );
    }
    
    $raw_fields = $record->get( 'fields' );
    foreach ( $raw_fields as $id => $field ) {
        $evt_data['properties'][ $id ] = $field['value'];
    }

    $base64_encoded = base64_encode(json_encode($evt_data));
    $url = "https://a.klaviyo.com/api/track?data=" . $base64_encoded;

    $result = wp_remote_get($url);
}

add_action('woocommerce_before_checkout_form', 'klaviyo_checkout_subscribe');
function klaviyo_checkout_subscribe() {
    $klaviyo_settings = get_option( 'klaviyo_settings' );

    $public_api_key = "USsaAM";
    $priv_key = 'pk_c2a9b8c87080149a9291410a32648ff4ce';

    if (
        isset( $klaviyo_settings['klaviyo_subscribe_checkbox'] )
        && $klaviyo_settings['klaviyo_subscribe_checkbox']
        && !empty( $klaviyo_settings['klaviyo_newsletter_list_id'] )
    ) {
        $list_id = $klaviyo_settings['klaviyo_newsletter_list_id'];

        remove_filter('woocommerce_checkout_fields', 'kl_sms_consent_checkout_field', 11);

        if ( is_user_logged_in() ) {
            $current_user = wp_get_current_user();
            $user_email = $current_user->user_email;

            $url = "https://a.klaviyo.com/api/lists/{$list_id}/profiles/?fields[profile]=email&page[size]=100";
        
            $args = array(
                'headers' => array(
                    'Authorization' => "Klaviyo-API-Key pk_c2a9b8c87080149a9291410a32648ff4ce",
                    'accept' => 'application/json',
                    'revision' => '2023-02-22',
                )
            );

            $w_condition = true;
            $is_user_subscribed = false;

            while ( $w_condition ) {
                $response = wp_remote_get($url, $args);

                if ( is_array( $response ) && ! is_wp_error( $response ) ) {
                    $headers = $response['headers']; // array of http header lines
                    $body    = $response['body']; // use the content
                    $data = json_decode( $body, true );
                    if ( !isset( $data['data'] ) ) {
                        error_log( $user_email . " is tring to get data, but there is a problem with API.");
                        break;
                    } else {
                        $profiles = $data['data'];
                        if ( !empty( $profiles ) ) {
                            $email_list = array_map( function( $a ){return $a['attributes']['email'];}, $profiles );
                            if ( !empty( $email_list ) ) {
                                if ( in_array( $user_email, $email_list ) ) {
                                    $is_user_subscribed = true;
                                    $w_condition = false;
                                    break;
                                }
                            }                       

                            if ( empty( $data['links']['next'] ) ) {
                                $w_condition = false;
                                break;
                            } else {
                                $url = $data['links']['next'];
                            }
                        } else {
                            $w_condition = false;
                            break;
                        }
                    }
                }
            }
            
            error_log( $user_email . " is checking.");
            
            if ( $is_user_subscribed ) {
                error_log( $user_email . " is already subscribed.");
                remove_filter('woocommerce_checkout_fields', 'kl_checkbox_custom_checkout_field', 11);
                remove_filter( 'woocommerce_after_checkout_billing_form', 'kl_sms_compliance_text' );
            }
            
        }
    }
}