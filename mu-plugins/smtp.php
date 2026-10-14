<?php
/**
 * Envoi des e-mails WordPress par SMTP.
 *
 * Réglages dans wp-config.php (rien n'est envoyé par SMTP si SMTP_HOST n'est pas défini) :
 *   define('SMTP_HOST', 'smtp.exemple.fr');
 *   define('SMTP_PORT', 587);
 *   define('SMTP_USER', 'contact@maktabaelhikma.fr');   // facultatif
 *   define('SMTP_PASS', 'mot-de-passe');                // facultatif
 *   define('SMTP_SECURE', 'tls');                       // 'tls', 'ssl' ou vide
 *
 * En local, docker-compose définit SMTP_HOST = mailpit : les e-mails arrivent
 * dans Mailpit (http://localhost:8025) au lieu de partir pour de vrai.
 */

add_action('phpmailer_init', function ($phpmailer) {
    if (!defined('SMTP_HOST') || !SMTP_HOST) {
        return;
    }

    $phpmailer->isSMTP();
    $phpmailer->Host = SMTP_HOST;
    $phpmailer->Port = defined('SMTP_PORT') ? (int) SMTP_PORT : 587;

    if (defined('SMTP_USER') && SMTP_USER) {
        $phpmailer->SMTPAuth = true;
        $phpmailer->Username = SMTP_USER;
        $phpmailer->Password = defined('SMTP_PASS') ? SMTP_PASS : '';
    }

    $secure = defined('SMTP_SECURE') ? SMTP_SECURE : '';
    $phpmailer->SMTPSecure  = $secure;
    $phpmailer->SMTPAutoTLS = $secure !== '';
});

// Trace l'erreur dans le journal PHP plutôt que d'échouer en silence
add_action('wp_mail_failed', function ($error) {
    error_log('[maktaba] e-mail non envoyé : ' . $error->get_error_message());
});
