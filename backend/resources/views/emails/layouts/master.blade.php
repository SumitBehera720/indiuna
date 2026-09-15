<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Indiuna')</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f4f4f5;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #18181b;
            -webkit-text-size-adjust: 100%;
        }
        .wrapper {
            width: 100%;
            background-color: #f4f4f5;
            padding: 40px 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        .header {
            background-color: #09090b;
            padding: 30px;
            text-align: center;
        }
        .header img {
            max-height: 48px;
            width: auto;
        }
        .header-title {
            color: #ffffff;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: 2px;
            margin: 0;
            text-transform: uppercase;
        }
        .header-subtitle {
            color: #a1a1aa;
            font-size: 11px;
            letter-spacing: 3px;
            margin-top: 6px;
            text-transform: uppercase;
        }
        .content {
            padding: 36px 30px;
        }
        .greeting {
            font-size: 20px;
            font-weight: 700;
            color: #09090b;
            margin-bottom: 16px;
        }
        p {
            font-size: 15px;
            line-height: 1.6;
            color: #3f3f46;
            margin: 0 0 16px 0;
        }
        .btn {
            display: inline-block;
            background-color: #ff2e93;
            color: #ffffff !important;
            font-weight: 600;
            font-size: 15px;
            padding: 14px 28px;
            border-radius: 8px;
            text-decoration: none;
            margin: 20px 0;
            text-align: center;
        }
        .badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .badge-success { background-color: #dcfce7; color: #166534; }
        .badge-info { background-color: #e0f2fe; color: #075985; }
        .badge-warning { background-color: #fef3c7; color: #92400e; }
        .badge-danger { background-color: #fee2e2; color: #991b1b; }

        .order-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin: 16px 0;
        }
        .table th {
            text-align: left;
            font-size: 12px;
            text-transform: uppercase;
            color: #71717a;
            padding-bottom: 10px;
            border-bottom: 1px solid #e4e4e7;
        }
        .table td {
            padding: 12px 0;
            font-size: 14px;
            border-bottom: 1px solid #f4f4f5;
        }
        .total-row td {
            font-weight: 700;
            font-size: 16px;
            color: #09090b;
            border-bottom: none;
            padding-top: 16px;
        }
        .footer {
            background-color: #fafafa;
            border-top: 1px solid #f4f4f5;
            padding: 24px 30px;
            text-align: center;
            font-size: 13px;
            color: #71717a;
        }
        .footer a {
            color: #ff2e93;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <h1 class="header-title">INDIUNA</h1>
                <div class="header-subtitle">EMBROIDERY &amp; CUSTOMS</div>
            </div>
            
            <div class="content">
                @yield('content')
            </div>
            
            <div class="footer">
                <p style="margin-bottom: 8px;">Need help? Contact us at <a href="mailto:support@indiuna.com">support@indiuna.com</a></p>
                <p style="font-size: 12px; color: #a1a1aa; margin: 0;">&copy; {{ date('Y') }} Indiuna. All rights reserved. <br>indiuna.com</p>
            </div>
        </div>
    </div>
</body>
</html>
