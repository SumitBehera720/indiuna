<?php

namespace App\Exceptions;

use Exception;

class PaymentFailedException extends Exception
{
    public function __construct(string $message = 'Payment processing failed', int $code = 402, ?\Throwable $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }
}
