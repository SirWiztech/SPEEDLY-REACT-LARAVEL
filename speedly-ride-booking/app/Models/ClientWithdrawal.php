<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClientWithdrawal extends Model
{
    const UPDATED_AT = null;

    protected $fillable = [
        'client_id', 'amount', 'bank_name', 'bank_code',
        'account_number', 'account_name', 'status',
        'processed_by', 'rejection_reason', 'processed_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'processed_at' => 'datetime',
        'created_at' => 'datetime',
    ];

    public function client()
    {
        return $this->belongsTo(ClientProfile::class, 'client_id');
    }

    public function processor()
    {
        return $this->belongsTo(User::class, 'processed_by');
    }
}
