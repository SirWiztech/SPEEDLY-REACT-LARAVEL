<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DriverWithdrawal extends Model
{
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'driver_id', 'amount', 'bank_name', 'account_number',
        'account_name', 'status', 'processed_by', 'rejection_reason', 'processed_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'processed_at' => 'datetime',
    ];

    public function driver()
    {
        return $this->belongsTo(DriverProfile::class, 'driver_id');
    }
}
