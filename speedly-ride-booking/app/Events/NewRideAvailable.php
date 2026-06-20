<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;

class NewRideAvailable implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

    public array $ride;
    protected string $driverId;

    public function __construct(string $driverId, array $ride)
    {
        $this->driverId = $driverId;
        $this->ride = $ride;
    }

    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel('driver.' . $this->driverId);
    }

    public function broadcastAs(): string
    {
        return 'ride.available';
    }

    public function broadcastWith(): array
    {
        return [
            'ride' => $this->ride,
        ];
    }
}
