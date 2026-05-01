<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClientProfile extends Model
{
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'user_id', 'membership_tier', 'total_rides',
        'average_rating', 'total_reviews',
    ];

    protected $casts = [
        'average_rating' => 'decimal:2',
        'total_rides' => 'integer',
        'total_reviews' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function rides()
    {
        return $this->hasMany(Ride::class, 'client_id');
    }

    public function clientRatings()
    {
        return $this->hasMany(ClientRating::class, 'client_id');
    }
}
