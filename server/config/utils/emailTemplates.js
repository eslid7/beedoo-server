//ServicesEmailTemplate
var serviceEmailTemplate_location = "http://localhost:" + (process.env.PORT || 5050);
var serviceEmailTemplate_appName = "beedooServer";
var serviceEmailTemplate_font = "Helvetica Neue";

module.exports = {
	headMail: function () {
		return "";
	},
	footerMail: function () {
		return "";
	},
	accountConfirmation: function(param) {
		var templateEmail = this.headMail();
		templateEmail += `
			<table width="100%" cellspacing="0" cellpadding="0" border="0" valign="top">
				<tbody>
					<tr>
						<td valign="top" align="left" style="word-break:normal;border-collapse:collapse;font-family:proxima_nova,${serviceEmailTemplate_font},Helvetica,Arial,sans-serif;font-size:25px;line-height:30px;color:#555555;font-weight:100;letter-spacing:0.02em;padding:0px 20px 0px 20px">
							Hola ${param.name} ${param.lastName},
						</td>
					</tr>
				</tbody>
			</table>
			<br>
			<table width="100%" cellspacing="0" cellpadding="0" border="0" valign="top">
				<tbody>
					<tr>
						<td valign="top" align="left" style="word-break:normal;border-collapse:collapse;font-family:proxima_nova, ${serviceEmailTemplate_font},Helvetica,Arial,sans-serif;font-size:15px;line-height:20px;color:#555555;font-weight:300;letter-spacing:0.02em;padding:0px 20px 0px 20px">
							para activar su cuenta en ${serviceEmailTemplate_appName}, necesita dar click a este link:
						</td>
					</tr>
					<tr>
						<td valign="top" align="left" style="word-break:normal;border-collapse:collapse;font-family:proxima_nova, ${serviceEmailTemplate_font},Helvetica,Arial,sans-serif;font-size:15px;line-height:20px;color:#555555;font-weight:300;letter-spacing:0.02em;padding:0px 20px 0px 20px">
							<a target="_blank" style="color:#EB8723;text-decoration:none" border="0" href="${serviceEmailTemplate_location}/api/auth/accountConfirmation?u=${encodeURIComponent(param.encryptData)}">Da click aquí</a>
						</td>
					</tr>
					<tr>
						<td valign="top" align="left" style="word-break:normal;border-collapse:collapse;font-family:proxima_nova, ${serviceEmailTemplate_font},Helvetica,Arial,sans-serif;font-size:15px;line-height:20px;color:#555555;font-weight:300;letter-spacing:0.02em;padding:0px 20px 0px 20px">
							Nuestros mejores deseos, El equipo de ${serviceEmailTemplate_appName}
						</td>
					</tr>
				</tbody>
			</table>
		`;
		templateEmail += this.footerMail();
		return templateEmail;
	}
};