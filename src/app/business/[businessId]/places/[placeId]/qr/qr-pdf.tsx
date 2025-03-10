/* eslint-disable jsx-a11y/alt-text */
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
  Image,
  Svg
} from '@react-pdf/renderer';

Font.register({
  family: 'Roboto',
  src: '/assets/fonts/Tajawal-ExtraBold.ttf'
});

Font.register({
  family: 'Tajawal',
  src: '/assets/fonts/Tajawal-Regular.ttf'
});

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#3431c4',
    color: 'white',
    padding: 24,
    textAlign: 'center',
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative'
  },
  container: {
    width: '90%',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  header: {
    marginTop: 48
  },
  title: {
    fontFamily: 'Roboto',
    fontSize: 38,
    fontWeight: 'bold',
    marginBottom: 10
  },
  subtitle: {
    fontFamily: 'Tajawal',
    fontSize: 29,
    fontWeight: 'light'
  },

  scanLabel: {
    fontFamily: 'Roboto',
    top: 50,
    backgroundColor: 'black',
    color: 'white',
    paddingVertical: 11,
    paddingHorizontal: 50,
    borderRadius: 14,
    fontSize: 35,
    paddingTop: 20,
    fontWeight: 'bold'
  },

  qrContainer: {
    position: 'relative',
    marginTop: 10,
    zIndex: 1
  },

  qrBox: {
    borderRadius: 30,
    borderWidth: 13,
    borderColor: 'black',
    width: 450,
    height: 420,
    position: 'relative',
    padding: 40,
    backgroundColor: 'white'
  },
  qrimage: {
    width: '100%',
    height: '100%',
    borderRadius: 14
  },

  qrContent: {
    width: '100%',
    height: '100vh',
    backgroundColor: 'white',
    borderRadius: 18
  },

  footer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10
  },
  subtitleFooter: {
    fontSize: 25
  },
  logo: {
    width: 50,
    height: 50,
    marginBottom: 27,
    marginRight: 1
  },
  footerLogo: {
    marginTop: 30,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  logoText: {
    fontFamily: 'Roboto',
    fontSize: 50
  }
});

// Create Document Component

export default function QrPdfDocument({ image }: { image: string }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Pay here with Brussels Pay</Text>
            <Text style={styles.subtitle}>
              Local payments for local businesses
            </Text>
          </View>

          <Text style={styles.scanLabel}>Scan to pay</Text>
          <View style={styles.qrContainer}>
            <View style={styles.qrBox}>
              <Image style={styles.qrimage} src={image} />
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.subtitleFooter}>
              learn more at{' '}
              <Text style={{ textDecoration: 'underline' }}>pay.brussels</Text>
            </Text>
          </View>

          <View style={styles.footerLogo}>
            <Image style={styles.logo} src="/assets/img/logo.png" />
            <Text style={styles.logoText}>Pay</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
