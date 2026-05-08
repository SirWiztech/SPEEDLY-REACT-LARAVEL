<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ClientProfile extends Model
{
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = (string) Str::uuid();
            }
        });
    }

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
