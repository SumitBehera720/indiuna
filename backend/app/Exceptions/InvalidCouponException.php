<?php

namespace App\Exceptions;

use Exception;

class InvalidCouponException extends Exception
{
    public function __construct(string $message = 'Invalid or expired coupon', int $code = 422, ?\Throwable $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }
}
