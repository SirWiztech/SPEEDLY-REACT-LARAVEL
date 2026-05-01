<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DriverProfile extends Model
{
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'user_id', 'license_number', 'license_expiry',
        'driver_status', 'verification_status', 'is_available',
        'current_latitude', 'current_longitude', 'last_location_update',
        'completed_rides', 'average_rating', 'total_reviews', 'total_earnings',
    ];

    protected $casts = [
        'is_available' => 'boolean',
        'current_latitude' => 'decimal:8',
        'current_longitude' => 'decimal:8',
        'last_location_update' => 'datetime',
        'license_expiry' => 'date',
        'completed_rides' => 'integer',
        'average_rating' => 'decimal:2',
        'total_reviews' => 'integer',
        'total_earnings' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function vehicles()
    {
        return $this->hasMany(DriverVehicle::class, 'driver_id');
    }

    public function rides()
    {
        return $this->hasMany(Ride::class, 'driver_id');
    }

    public function kycDocuments()
    {
        return $this->hasMany(DriverKycDocument::class, 'driver_id');
    }

    public function approvalQueue()
    {
        return $this->hasMany(DriverApprovalQueue::class, 'driver_id');
    }

    public function withdrawals()
    {
        return $this->hasMany(DriverWithdrawal::class, 'driver_id');
    }

    public function bankDetails()
    {
        return $this->hasMany(DriverBankDetail::class, 'driver_id');
    }

    public function ratings()
    {
        return $this->hasMany(DriverRating::class, 'driver_id');
    }
}
