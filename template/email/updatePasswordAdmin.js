module.exports = (full_name = 'full name', email = 'abdramsyah@gmail.com', resetLink) => {
  return `

<!DOCTYPE html
    PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="">

<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Verify your email address</title>
    <style type="text/css" media="all">
        /* Base ------------------------------ */
        *:not(br):not(tr):not(html) {
            font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
            -webkit-box-sizing: border-box;
            box-sizing: border-box;
        }

        body {
            max-width: 600px;
            width: 100% !important;
            height: 100%;
            margin: auto;
            line-height: 1.4;
            background-color: #EBFAF7;
            color: #2a045c;
            -webkit-text-size-adjust: none;
        }

        a {
            color: #414EF9;
        }

        /* Layout ------------------------------ */
        .email-wrapper {
            width: 88%;
            margin: 0;
            padding: 0;
            background-color: #EBFAF7;
        }

        .email-content {
            width: 100%;
            margin: 0;
            padding: 0;
        }

        /* Masthead ----------------------- */
        .email-masthead {
            padding: 25px 0;
            text-align: center;
        }

        .email-masthead_logo {
            max-width: 400px;
            border: 0;
        }

        .email-masthead_name {
            font-size: 16px;
            font-weight: bold;
            color: #839197;
            text-decoration: none;
            text-shadow: 0 1px 0 white;
        }

        /* Body ------------------------------ */
        .email-body {
            width: 100%;
            margin: 0;
            padding: 0;
            border-top: 1px solid #E7EAEC;
            border-bottom: 1px solid #E7EAEC;
            background-color: #FFFFFF;
        }

        .email-body_inner {
            width: 100%;
            margin: 0 auto;
            padding: 0;
        }

        .email-footer {
            width: 570px;
            margin: 0 auto;
            padding: 0;
            text-align: center;
        }

        .email-footer p {
            color: #839197;
        }

        .body-action {
            width: 100%;
            margin: 30px auto;
            padding: 0;
            text-align: center;
        }

        .body-sub {
            margin-top: 25px;
            padding-top: 25px;
            border-top: 1px solid #E7EAEC;
        }

        .content-cell {
            padding: 35px;
        }

        .align-right {
            text-align: right;
        }

        /* Type ------------------------------ */
        h1 {
            margin-top: 0;
            color: #292E31;
            font-size: 19px;
            font-weight: bold;
            text-align: left;
        }

        h2 {
            margin-top: 0;
            color: #292E31;
            font-size: 16px;
            font-weight: bold;
            text-align: left;
        }

        h3 {
            margin-top: 0;
            color: #292E31;
            font-size: 14px;
            font-weight: bold;
            text-align: left;
        }

        p {
            margin-top: 0;
            color: #839197;
            font-size: 16px;
            line-height: 1.5em;
            text-align: left;
        }

        p.sub {
            font-size: 12px;
        }

        p.center {
            text-align: center;
        }

        /* Buttons ------------------------------ */
        .button {
            display: inline-block;
            width: 490px;
            height: 64px;
            border-radius: 5px;
            color: #FFFFFF;
            background-color: #177365;
            font-size: 20px;
            line-height: 45px;
            /* font-family: 'Inter', sans-serif; */
            text-align: center;
            text-decoration: none;
            -webkit-text-size-adjust: none;
            mso-hide: all;
            padding: 10px;
        }

        .button--white {
            background-color: #FFFFFF;
        }

        .button--green {
            background-color: #28DB67;
        }

        .button--red {
            background-color: #FF3665;
        }

        .button--blue {
            border: 1px solid #839197
                /*background-color: #496c7f;*/
        }

        /*Media Queries ------------------------------ */
        @media only screen and (max-width: 600px) {

            .email-body_inner,
            .email-footer {
                width: 100% !important;
            }
        }

        @media only screen and (max-width: 500px) {
            .button {
                width: 100% !important;
            }
        }
    </style>
</head>

<body style="background:#ebfaf7; padding:10px">
    <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" style="margin: 6% 6% 6%; ">
        <tr>
            <td align="center" style="text-align:center;">
                <table class="" width="100%" cellpadding="0" cellspacing="0">
                    <!-- Logo -->
                    <!-- <img style="margin-top:15px;margin-bottom:15px;width:auto;height:60px;" alt="logo"
                        class="logo-company mx-auto justify-content-center"
                        src="https://payok-toko-bucket.s3.ap-southeast-1.amazonaws.com/test-full.png"> -->


                    <!-- Email Body -->
                    <tr>

                        <td class="email-body" width="100%">

                            <svg style="margin-top:15px;margin-bottom:15px;width:auto;height:60px;" alt="logo"
                                class="logo-company mx-auto justify-content-center" viewBox="0 0 261 78" fill="none"
                                xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                                <rect width="260.812" height="78" fill="url(#pattern0)" />
                                <defs>
                                    <pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">
                                        <use xlink:href="#image0_2038_17541"
                                            transform="matrix(0.00287356 0 0 0.00960848 0 -0.00924928)" />
                                    </pattern>
                                    <image id="image0_2038_17541" width="348" height="106"
                                        xlink:href="data:image/png;base64,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" />
                                </defs>
                            </svg>
                            <table class="email-body_inner" align="center" width="100%" cellpadding="0" cellspacing="0">
                                <!-- Body content -->
                                <tr>
                                    <td class="content-cell">
                                        <a class="email-masthead_name">Kode Verifikasi Grosri</a>
                                        <p style="margin-top:20px;">Hello ${full_name},
                                        </p>
                                        <p style="margin-top:20px;">In order to use Grosri Operation Dasboar account
                                            associated with ${email}, you have to update your
                                            password.
                                        </p>
                                        <p style="margin-top:20px;">You can use the following button to update your
                                            password:
                                        </p>

                                        <!-- Action -->
                                        <table class="body-action" align="center" width="100%" cellpadding="0"
                                            cellspacing="0">
                                            <tr>
                                                <td align="center">
                                                    <div>
                                                        <!-- <p class="button button--blue"
                                                            style="letter-spacing:4pt;font-size:20px">
                                                            <b>${resetLink}</b>
                                                        </p> -->
                                                        
                                                        <a href="${resetLink}" target="_blank" class="button button--blue"
                                                            style="height:45px; font-size: 20px; color: white;">Update Password</a>

                                                        <br><br><br>
                                                        <p style="margin-top:20px;">
                                                            Please do not reply to this email with your password.
                                                        </p>
                                                        <p style="margin-top:20px;">
                                                            We will never ask for your password, and we strongly
                                                            discourage you from sharing it anyone.
                                                        </p><br>
                                                        <p style="margin-top:20px;">
                                                            Thanks,
                                                        </p>
                                                        <p style="margin-top:20px;">
                                                            Grosri Team
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                  
                </table>
            </td>
        </tr>
    </table>
</body>

</html>

  `;
};
