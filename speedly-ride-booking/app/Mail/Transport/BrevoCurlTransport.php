<?php

namespace App\Mail\Transport;

use Symfony\Component\Mailer\SentMessage;
use Symfony\Component\Mailer\Transport\AbstractTransport;
use Symfony\Component\Mime\Address;
use Symfony\Component\Mime\MessageConverter;

class BrevoCurlTransport extends AbstractTransport
{
    public function __construct(
        private string $apiKey,
    ) {
        parent::__construct();
    }

    protected function doSend(SentMessage $message): void
    {
        $email = MessageConverter::toEmail($message->getOriginalMessage());
        $envelope = $message->getEnvelope();

        // Build sender — use getAddress() (Symfony 8.x), not getEncodedAddress() (removed)
        $fromAddr = $envelope->getSender();
        $sender = ['email' => $fromAddr->getAddress()];
        if ($fromAddr->getName()) {
            $sender['name'] = $fromAddr->getName();
        }

        // Collect recipients
        $recipients = $envelope->getRecipients();
        if (empty($recipients)) {
            $recipients = $email->getTo();
        }

        $to = [];
        foreach ($recipients as $recipient) {
            $entry = ['email' => $recipient->getAddress()];
            if ($recipient->getName()) {
                $entry['name'] = $recipient->getName();
            }
            $to[] = $entry;
        }

        $payload = [
            'sender'  => $sender,
            'to'      => $to,
            'subject' => $email->getSubject() ?: '—',
        ];

        if ($email->getHtmlBody()) {
            $payload['htmlContent'] = $email->getHtmlBody();
        }
        if ($email->getTextBody()) {
            $payload['textContent'] = $email->getTextBody();
        }

        // Reply-To
        if ($replyTo = $email->getReplyTo()) {
            $addr = $replyTo[0];
            $payload['replyTo'] = ['email' => $addr->getAddress()];
            if ($addr->getName()) {
                $payload['replyTo']['name'] = $addr->getName();
            }
        }

        $ch = curl_init();

        curl_setopt_array($ch, [
            CURLOPT_URL            => 'https://api.brevo.com/v3/smtp/email',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 30,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => json_encode($payload),
            CURLOPT_HTTPHEADER     => [
                'api-key: ' . $this->apiKey,
                'Content-Type: application/json',
                'Accept: application/json',
            ],
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
        ]);

        // Try common CA bundle paths
        foreach ([
            '/etc/ssl/certs/ca-certificates.crt',
            '/etc/ssl/certs/ca-bundle.crt',
            '/etc/pki/tls/certs/ca-bundle.crt',
            '/etc/ssl/ca-bundle.pem',
            '/etc/ssl/cert.pem',
            '/usr/local/share/certs/ca-root-nss.crt',
            '/etc/ssl/certs/cacert.pem',
            ini_get('curl.cainfo'),
            ini_get('openssl.cafile'),
        ] as $path) {
            if ($path && file_exists($path)) {
                curl_setopt($ch, CURLOPT_CAINFO, $path);
                break;
            }
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error    = curl_error($ch);
        curl_close($ch);

        if ($error) {
            throw new \Symfony\Component\Mailer\Exception\TransportException(
                'Brevo API request failed: ' . $error
            );
        }

        $data = json_decode($response, true);

        if ($httpCode !== 201) {
            $msg = $data['message'] ?? $response;
            throw new \Symfony\Component\Mailer\Exception\TransportException(
                'Brevo API error (HTTP ' . $httpCode . '): ' . $msg
            );
        }

        if (!empty($data['messageId'])) {
            $message->setMessageId($data['messageId']);
        }
    }

    public function __toString(): string
    {
        return 'brevo+curl://api.brevo.com';
    }
}
