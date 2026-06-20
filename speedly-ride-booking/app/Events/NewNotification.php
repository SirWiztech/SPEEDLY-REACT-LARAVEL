<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;

class NewNotification implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

    public string $title;
    public string $message;
    public string $type;
    public string $userId;

    public function __construct(string $userId, string $title, string $message, string $type = 'info')
    {
        $this->userId = $userId;
        $this->title = $title;
        $this->message = $message;
        $this->type = $type;
    }

    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel('App.Models.User.' . $this->userId);
    }

    public function broadcastAs(): string
    {
        return 'notification.new';
    }

    public function broadcastWith(): array
    {
        return [
            'title' => $this->title,
            'message' => $this->message,
            'type' => $this->type,
        ];
    }
}
