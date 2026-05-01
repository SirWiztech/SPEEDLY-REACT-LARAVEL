<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DriverBankDetail extends Model
{
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'driver_id', 'bank_name', 'account_number',
        'account_name', 'is_default',
    ];

    protected $casts = [
        'is_default' => 'boolean',
    ];

    public function driver()
    {
        return $this->belongsTo(DriverProfile::class, 'driver_id');
    }
}
